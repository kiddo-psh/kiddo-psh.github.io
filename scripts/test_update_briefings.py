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

    def test_newer_relevant_paper_is_preferred_and_version_is_removed(self):
        xml = """<feed xmlns="http://www.w3.org/2005/Atom">
          <entry><title>Agent Memory Benchmark</title><id>http://arxiv.org/abs/2609.12345v2</id>
            <published>2026-09-15T02:00:00Z</published><summary>LLM agent evaluation.</summary></entry>
        </feed>"""
        papers = briefing.paper_candidates(xml)
        self.assertEqual(papers[0]["sourceUrl"], "https://arxiv.org/abs/2609.12345")
        older = {**papers[0], "sourceUrl": "https://arxiv.org/abs/2609.00001",
                 "publishedAt": "2026-09-01", "title": "Agent benchmark for coding tools"}
        chosen = briefing.eligible([older, papers[0]], set(), datetime(2026, 9, 16, tzinfo=timezone.utc))
        self.assertEqual(chosen[0]["sourceUrl"], papers[0]["sourceUrl"])

    def test_interview_requires_transcript_heading(self):
        page = "<article><p>Sponsor text</p><h2>Transcript</h2><p>Guest describes tool use.</p></article>"
        self.assertEqual(briefing.transcript_text(page), "Guest describes tool use.")
        self.assertEqual(briefing.transcript_text("<article><p>Show notes only</p></article>"), "")

    def test_structured_summary_response_is_validated(self):
        summary = {"preview": "한눈에 보기", "keyPoints": ["a", "b", "c"],
                   "limitations": ["한계 1", "한계 2"], "takeaway": "적용점",
                   "tags": ["agent-design", "tools-mcp"]}
        response = {"status": "completed", "output": [{"type": "message", "content": [
            {"type": "output_text", "text": json.dumps(summary)}]}]}

        def fake_urlopen(request, timeout):
            payload = json.loads(request.data)
            self.assertFalse(payload["store"])
            self.assertEqual(payload["text"]["format"]["type"], "json_schema")
            return io.BytesIO(json.dumps(response).encode())

        with patch.object(briefing, "urlopen", fake_urlopen):
            result = briefing.summarize({"type": "article", "title": "Agent tools",
                                         "sourceUrl": "https://openai.com/news/example"},
                                        "Source text", "기사 본문", "test-key", "gpt-5-mini")
        self.assertEqual(result, summary)

    def test_structured_summary_rejects_unknown_tag(self):
        summary = {"preview": "한눈에 보기", "keyPoints": ["a", "b", "c"],
                   "limitations": ["한계 1", "한계 2"], "takeaway": "적용점",
                   "tags": ["unknown-topic"]}
        response = {"status": "completed", "output": [{"type": "message", "content": [
            {"type": "output_text", "text": json.dumps(summary)}]}]}

        with patch.object(briefing, "urlopen", lambda request, timeout: io.BytesIO(json.dumps(response).encode())):
            with self.assertRaisesRegex(RuntimeError, "태그"):
                briefing.summarize({"type": "article", "title": "Agent tools",
                                     "sourceUrl": "https://openai.com/news/example"},
                                    "Source text", "기사 본문", "test-key", "gpt-5-mini")

    def test_long_interview_keeps_start_middle_and_end(self):
        source = "A" * 40 + "B" * 40 + "C" * 40
        sampled = briefing.sample_source_text(source, max_chars=48)
        self.assertIn("A" * 24, sampled)
        self.assertIn("B" * 12, sampled)
        self.assertIn("C" * 12, sampled)
        self.assertIn("[중간 부분 생략]", sampled)


if __name__ == "__main__":
    unittest.main()
