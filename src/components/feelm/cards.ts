export interface CharacterCard {
  code: string;
  name: string;
  axes: [string, string, string, string];
}

export const characterCards: CharacterCard[] = [
  { code: 'ELHV', name: '길 위의 낙천가', axes: ['새로움', '밝음', '후함', '많음'] },
  { code: 'ELHS', name: '토끼굴에 빠진 아이', axes: ['새로움', '밝음', '후함', '적음'] },
  { code: 'ELMV', name: '세계 일주하는 수집가', axes: ['새로움', '밝음', '박함', '많음'] },
  { code: 'ELMS', name: '풀숲의 관찰자', axes: ['새로움', '밝음', '박함', '적음'] },
  { code: 'EDHV', name: '복수자', axes: ['새로움', '어두움', '후함', '많음'] },
  { code: 'EDHS', name: '돌아오지 못한 자', axes: ['새로움', '어두움', '후함', '적음'] },
  { code: 'EDMV', name: '금기를 여는 자', axes: ['새로움', '어두움', '박함', '많음'] },
  { code: 'EDMS', name: '심연을 들여다본 학자', axes: ['새로움', '어두움', '박함', '적음'] },
  { code: 'RLHV', name: '이야기 많은 아이', axes: ['익숙함', '밝음', '후함', '많음'] },
  { code: 'RLHS', name: '무도회를 기다린 사람', axes: ['익숙함', '밝음', '후함', '적음'] },
  { code: 'RLMV', name: '동네 꾀돌이', axes: ['익숙함', '밝음', '박함', '많음'] },
  { code: 'RLMS', name: '등대지기', axes: ['익숙함', '밝음', '박함', '적음'] },
  { code: 'RDHV', name: '잠 못 드는 파수꾼', axes: ['익숙함', '어두움', '후함', '많음'] },
  { code: 'RDHS', name: '비극의 주인공', axes: ['익숙함', '어두움', '후함', '적음'] },
  { code: 'RDMV', name: '안락의자 탐정', axes: ['익숙함', '어두움', '박함', '많음'] },
  { code: 'RDMS', name: '금고지기', axes: ['익숙함', '어두움', '박함', '적음'] },
];
