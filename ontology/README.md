# 한글정음 온톨로지

훈민정음 해례본 번역 작업의 지식베이스. 개념·글자·인물·출처·용어를 연결된 엔티티로 관리.

## 엔티티 분류

| 엔티티 | 파일 | 설명 |
|--------|------|------|
| **개념** (Concept) | [concepts.md](concepts.md) | 우주철학·언어학 개념 (하사땅, 밝이어, 원세네 등) |
| **글자** (Letter) | [letters.md](letters.md) | 한글 자모와 속성 (ㅇ ㅅ ㅁ · ㅣ ㅡ 외) |
| **용어** (Term) | [terms.md](terms.md) | 번역자가 도입한 새 용어 (하사땅·다움 등) |
| **인물** (Person) | [people.md](people.md) | 세종·정인지·집현전 학자·번역자 등 |
| **출처** (Source) | [sources.md](sources.md) | 참고 문헌·인용 |
| **용어집** (Glossary) | [glossary.md](glossary.md) | 한-영 매핑 |
| **관계** (Relation) | [relations.md](relations.md) | 엔티티 간 연결 |
| **작업 로그** | [CHANGELOG.md](CHANGELOG.md) | 정제 작업 기록 (시간순) |

## 식별자 규약

각 엔티티는 `#카테고리:슬러그` 형식의 ID 사용:

- 개념: `#concept:하사땅`, `#concept:밝이어`
- 글자: `#letter:ㅇ`, `#letter:ㅅ`
- 용어: `#term:다움`, `#term:시므`
- 인물: `#person:세종`, `#person:정인지`
- 출처: `#source:해례본-1446`
- 섹션: `#section:03-changje-wonri`

## 링크 규약

엔티티 참조는 위키스타일 `[[ID]]`:

```markdown
ㅇ은 [[#letter:ㅇ]] (Circle/Heaven)으로 [[#concept:하사땅]]에서 하늘에 해당한다.
```

## 메타데이터 frontmatter

각 엔티티는 YAML frontmatter 포함:

```yaml
---
id: concept:하사땅
name: 하사땅
type: 개념
aliases: [하늘사람땅, 천지인]
references:
  - section:03-changje-wonri
  - section:10-illeoddugi
status: confirmed   # confirmed | draft | proposed
---
```

## 사용 흐름

1. 챕터 정제 중 새 용어·개념 발견 → 해당 엔티티 파일에 추가
2. 엔티티 간 관계 → [relations.md](relations.md)에 기록
3. 변경 이력 → [CHANGELOG.md](CHANGELOG.md)에 기록
