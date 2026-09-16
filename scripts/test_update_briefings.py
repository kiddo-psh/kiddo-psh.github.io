"""네트워크/API 없이 수집 경계와 선별 규칙을 검증한다."""

import sys
from pathlib import Path
import io
import json
import unittest
from datetime import datetime, timezone
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
import update_briefings as briefing


class BriefingSelectionTest(unittest.TestCase):
    def test_rss_selection_limits_domain_age_and_subject(self):
        xml = """<rss><channel>
          <item><title>New agent tool design</title><link>https://openai.com/index/agent-tool/?utm_source=rss</link>
            <pubDate>Tue, 15 Sep 2026 12:00:00 GMT</pubDate><description>For developers</description></item>
          <item><title>Old agent tool design</title><link>https://openai.com/index/old-agent/</link>
            <pubDate>Tue, 01 Jun 2026 12:00:00 GMT</pubDate><description>For developers</description></item>
          <item><title>New agent funding</title><link>https://openai.com/index/funding/</link>
            <pubDate>Tue, 15 Sep 2026 12:00:00 GMT</pubDate><description>For developers</description></item>
          <item><title>New agent tool design</title><link>https://untrusted.example/news</link>
            <pubDate>Tue, 15 Sep 2026 12:00:00 GMT</pubDate><description>For developers</description></item>
        </channel></rss>"""
        parsed = briefing.parse_feed(xml, "article", "OpenAI", briefing.ALLOWED_ARTICLE_HOSTS)
        chosen = briefing.eligible(parsed, set(), datetime(2026, 9, 16, tzinfo=timezone.utc))
        self.assertEqual(len(chosen), 1)
        self.assertEqual(chosen[0]["sourceUrl"], "https://openai.com/index/agent-tool")

    def test_domestic_feed_scores_korean_keywords_and_excludes_recruiting(self):
        xml = """<rss><channel>
          <item><title>LLM 에이전트 평가 파이프라인 만들기</title><link>https://toss.tech/article/agent-eval</link>
            <pubDate>Tue, 15 Sep 2026 12:00:00 GMT</pubDate><description>도구 호출 검증</description></item>
          <item><title>AI 에이전트 개발자 채용</title><link>https://toss.tech/article/hiring</link>
            <pubDate>Tue, 15 Sep 2026 12:00:00 GMT</pubDate><description>에이전트 평가</description></item>
          <item><title>사내 카페 리뉴얼 후기</title><link>https://toss.tech/article/cafe</link>
            <pubDate>Tue, 15 Sep 2026 12:00:00 GMT</pubDate><description>인테리어</description></item>
        </channel></rss>"""
        parsed = briefing.parse_feed(xml, "domestic", "토스 테크", briefing.ALLOWED_DOMESTIC_HOSTS)
        chosen = briefing.eligible(parsed, set(), datetime(2026, 9, 16, tzinfo=timezone.utc))
        self.assertEqual([item["sourceUrl"] for item in chosen], ["https://toss.tech/article/agent-eval"])

    def test_more_relevant_item_beats_newer_item(self):
        strong = {"type": "article", "title": "Evaluating coding agents with tool benchmarks", "source": "A",
                  "sourceUrl": "https://a.example/strong", "publishedAt": "2026-09-10", "description": ""}
        weak = {"type": "article", "title": "Agent news", "source": "B",
                "sourceUrl": "https://b.example/weak", "publishedAt": "2026-09-15", "description": ""}
        chosen = briefing.eligible([weak, strong], set(), datetime(2026, 9, 16, tzinfo=timezone.utc))
        self.assertEqual(chosen[0]["sourceUrl"], strong["sourceUrl"])

    def test_every_feed_has_hosts_and_known_kind(self):
        for url, kind, source, hosts in briefing.FEEDS:
            self.assertIn(kind, briefing.MAX_PER_RUN, source)
            self.assertIn(kind, briefing.BODY_GUIDE, source)
            self.assertTrue(hosts, source)
            self.assertTrue(url.startswith("https://"), source)
        self.assertEqual(sum(briefing.MAX_PER_RUN.values()), 7)

    def test_newer_paper_wins_tie_on_relevance_and_version_is_removed(self):
        xml = """<feed xmlns="http://www.w3.org/2005/Atom">
          <entry><title>Agent Memory Benchmark</title><id>http://arxiv.org/abs/2609.12345v2</id>
            <published>2026-09-15T02:00:00Z</published><summary>LLM agent evaluation.</summary></entry>
        </feed>"""
        papers = briefing.paper_candidates(xml)
        self.assertEqual(papers[0]["sourceUrl"], "https://arxiv.org/abs/2609.12345")
        # 관련성 점수가 같을 때만 날짜가 순서를 정한다(점수 우선은 test_more_relevant_item_beats_newer_item)
        older = {**papers[0], "sourceUrl": "https://arxiv.org/abs/2609.00001", "publishedAt": "2026-09-01"}
        chosen = briefing.eligible([older, papers[0]], set(), datetime(2026, 9, 16, tzinfo=timezone.utc))
        self.assertEqual(chosen[0]["sourceUrl"], papers[0]["sourceUrl"])

    def test_interview_requires_transcript_heading(self):
        page = "<article><p>Sponsor text</p><h2>Transcript</h2><p>Guest describes tool use.</p></article>"
        self.assertEqual(briefing.transcript_text(page), "Guest describes tool use.")
        self.assertEqual(briefing.transcript_text("<article><p>Show notes only</p></article>"), "")

    def test_structured_summary_response_is_validated(self):
        summary = {"preview": "한눈에 보기",
                   "body": {"what": "무엇이 바뀌나", "concrete": "구체 하나", "open": "기사가 말하지 않은 것"},
                   "quote": {"text": "Source text", "ko": "원문", "where": "도입부"},
                   "tags": ["agent-design", "tools-mcp"]}
        response = {"status": "completed", "output": [{"type": "message", "content": [
            {"type": "output_text", "text": json.dumps(summary)}]}]}

        def fake_urlopen(request, timeout):
            payload = json.loads(request.data)
            self.assertFalse(payload["store"])
            self.assertEqual(payload["text"]["format"]["type"], "json_schema")
            self.assertIn("quote", payload["text"]["format"]["schema"]["required"])
            return io.BytesIO(json.dumps(response).encode())

        with patch.object(briefing, "urlopen", fake_urlopen):
            result = briefing.summarize({"type": "article", "title": "Agent tools",
                                         "sourceUrl": "https://openai.com/news/example"},
                                        "Source text", "기사 본문", "test-key", "gpt-5-mini")
        self.assertEqual(result, summary)

    def test_structured_summary_rejects_missing_body_slot(self):
        summary = {"preview": "한눈에 보기",
                   "body": {"what": "무엇이 바뀌나", "concrete": "구체 하나"},
                   "quote": {"text": "Source text", "ko": "원문", "where": "도입부"},
                   "tags": ["agent-design"]}
        response = {"status": "completed", "output": [{"type": "message", "content": [
            {"type": "output_text", "text": json.dumps(summary)}]}]}

        with patch.object(briefing, "urlopen", lambda request, timeout: io.BytesIO(json.dumps(response).encode())):
            with self.assertRaisesRegex(RuntimeError, "본문 칸"):
                briefing.summarize({"type": "article", "title": "Agent tools",
                                     "sourceUrl": "https://openai.com/news/example"},
                                    "Source text", "기사 본문", "test-key", "gpt-5-mini")

    def test_structured_summary_rejects_unknown_tag(self):
        summary = {"preview": "한눈에 보기",
                   "body": {"what": "무엇이 바뀌나", "concrete": "구체 하나", "open": "기사가 말하지 않은 것"},
                   "quote": {"text": "Source text", "ko": "원문", "where": "도입부"},
                   "tags": ["unknown-topic"]}
        response = {"status": "completed", "output": [{"type": "message", "content": [
            {"type": "output_text", "text": json.dumps(summary)}]}]}

        with patch.object(briefing, "urlopen", lambda request, timeout: io.BytesIO(json.dumps(response).encode())):
            with self.assertRaisesRegex(RuntimeError, "태그"):
                briefing.summarize({"type": "article", "title": "Agent tools",
                                     "sourceUrl": "https://openai.com/news/example"},
                                    "Source text", "기사 본문", "test-key", "gpt-5-mini")

    def test_structured_summary_rejects_quote_missing_from_source(self):
        summary = {"preview": "한눈에 보기",
                   "body": {"what": "무엇이 바뀌나", "concrete": "구체 하나", "open": "기사가 말하지 않은 것"},
                   "quote": {"text": "Invented quotation", "ko": "지어낸 인용", "where": "도입부"},
                   "tags": ["agent-design"]}
        response = {"status": "completed", "output": [{"type": "message", "content": [
            {"type": "output_text", "text": json.dumps(summary)}]}]}

        with patch.object(briefing, "urlopen", lambda request, timeout: io.BytesIO(json.dumps(response).encode())):
            with self.assertRaisesRegex(RuntimeError, "원문에서 찾을 수 없습니다"):
                briefing.summarize({"type": "article", "title": "Agent tools",
                                     "sourceUrl": "https://openai.com/news/example"},
                                    "Source text", "기사 본문", "test-key", "gpt-5-mini")

    def test_structured_summary_rejects_quote_over_25_words(self):
        source = " ".join(f"word{i}" for i in range(26))
        summary = {"preview": "한눈에 보기",
                   "body": {"what": "무엇이 바뀌나", "concrete": "구체 하나", "open": "기사가 말하지 않은 것"},
                   "quote": {"text": source, "ko": "긴 인용", "where": "도입부"},
                   "tags": ["agent-design"]}
        response = {"status": "completed", "output": [{"type": "message", "content": [
            {"type": "output_text", "text": json.dumps(summary)}]}]}

        with patch.object(briefing, "urlopen", lambda request, timeout: io.BytesIO(json.dumps(response).encode())):
            with self.assertRaisesRegex(RuntimeError, "25단어"):
                briefing.summarize({"type": "article", "title": "Agent tools",
                                     "sourceUrl": "https://openai.com/news/example"},
                                    source, "기사 본문", "test-key", "gpt-5-mini")

    def test_long_interview_keeps_start_middle_and_end(self):
        source = "A" * 40 + "B" * 40 + "C" * 40
        sampled = briefing.sample_source_text(source, max_chars=48)
        self.assertIn("A" * 24, sampled)
        self.assertIn("B" * 12, sampled)
        self.assertIn("C" * 12, sampled)
        self.assertIn("[중간 부분 생략]", sampled)


if __name__ == "__main__":
    unittest.main()
