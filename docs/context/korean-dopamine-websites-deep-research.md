# Korean "Dopamine Websites" — Deep Research Report

**Date:** 2026-06-10
**Purpose:** Background research for **nada**. This is the trend behind the [NEXTA tweet](./nexta_tv-2063252892199325983.md) that inspired the project.
**Method:** 5 parallel research agents (English + Korean sources), claims cross-verified across agents; unverified items flagged inline and in §10.

---

## TL;DR

The "dopamine website" trend is real but small, indie, and accidental. It consists of essentially **three solo-built Korean web services** — a fake delivery app (음식만안와요.com), a virtual smoke-break chat room (damta.world), and a cheap-eats map (거지맵.com) — built by individual twenty-somethings, monetized with nothing more than Google AdSense (or nothing at all), and serving hundreds to low tens-of-thousands of daily users. The global "trend" framing came from one Hankook Ilbo article (May 25, 2026) translated by Korea Times (May 27) and megaphoned by NEXTA (June 6). The Korean framing was **frugality/survival under inflation**, not "dopamine" — NEXTA dropped the economic context. There is no startup, no funding, no business model to speak of, and no Western competitor yet. The whitespace for nada is wide open.

---

## 1. Provenance: how the trend reached us

| Date | Event |
|---|---|
| Nov 2025 | damta.world launched via developer's LinkedIn post |
| ~Mar 2026 | 음식만안와요.com launch tweet by 말희 (@malheeelife); 거지맵 launches Mar 20; both go viral on Korean X/FM Korea |
| Apr 13–28, 2026 | Korean press wave: Money Today, MBC 뉴스투데이/뉴스데스크 (developer interviews on national TV), Financial News, Hankyung (critical piece) |
| May 25, 2026 | [Hankook Ilbo](https://www.hankookilbo.com/news/article/A2026052116520004512) coins the **"도파민 사이트" (dopamine site)** framing |
| May 27, 2026 | [Korea Times English translation](https://www.koreatimes.co.kr/lifestyle/trends/20260527/gen-z-turn-to-dopamine-sites-for-quick-comfort) — the single bridge article; same-day SCMP republication |
| Jun 6, 2026 | [NEXTA tweet](https://x.com/nexta_tv/status/2063252892199325983) goes viral; aggregator copycats (Polymarket etc.) follow |

Virtually all English coverage traces to that one translated article. No Hacker News thread, no significant Reddit discussion, no Verge/TechCrunch/BBC/NYT coverage found — Western awareness is essentially X-only as of this writing.

---

## 2. The actual sites

### 2.1 음식만안와요.com — "Only the Food Doesn't Come" (fake delivery app)

- **URL:** https://음식만안와요.com (punycode `xn--lz2bv9nd1bm2a9lo9a.com`)
- **Tagline (site meta):** "배달비와 칼로리를 아끼는 가짜배달앱" — *"the fake delivery app that saves you delivery fees and calories."* Baemin-mint theme color (#0ea768).
- **Contents/flow:** full replica of a Korean delivery-app ritual — restaurant cards with photos, star ratings, estimated delivery times; menu browsing; cart; address/contact entry; a fake "payment" step. On completing the fake order: a message showing **money and calories saved**, then a **"토끼 라이더" (rabbit rider)** is assigned with real-time fake delivery-status tracking. This is the direct ancestor of nada's intercept + theater concept — except the intercept comes *after* fake payment, with the courier tracking as bonus theater.
- **Creator:** a 21-year-old female university student — MBC names **박서현 (Park Seo-hyun)**; the launch X account is **말희 (@malheeelife)** (almost certainly the same person — flagged, not 100% confirmed). Launch tweet: "배달중독 심해서 가짜 배민/쿠팡 만들었습니다… 도파민은 나오고 통장 지키는 미친(P) 솔루션" — *"My delivery addiction was bad so I built a fake Baemin/Coupang… an insane solution where the dopamine comes out and your bank account stays intact."*
- **Marketing voice:** in-character world-building — e.g. a viral fake resignation letter from fictional rider "Kim Min-soo" who quit because "no matter how far I ride, no food ever arrives"; a thread on installing the PWA like a real app.
- **Usage:** **200–300 users/day** (creator, via MBC, Apr 2026). Users self-organized a "배달 참기 챌린지" (delivery-resisting challenge).
- **Notable quote (creator, MBC):** building/testing it made her stop ordering real delivery — "배달 앱을 꼴도 보기 싫더라" ("I couldn't stand the sight of real delivery apps anymore").
- "가짜 배민" ("fake Baemin") in headlines is a press nickname for this site, not a separate service.

### 2.2 damta.world — "온라인 담타" (online smoke break)

- **URL:** https://www.damta.world — "다같이 담배 타임," self-described as "a real-time social community **for non-smokers**."
- **Contents (verified firsthand):** interactive cigarette sim — press-and-hold to burn (~3 min, matching a real cigarette = built-in break timer), double-tap/shake to flick ash, long-press filter for donut smoke rings, optional ASMR burning sound. **Anonymous real-time chat**, zero signup, cute auto-assigned nicknames. **Themed rooms:** university front gate, baseball stadium, office rooftop, outer space, and a silence room. Auto-filtering of profanity/politics/doxxing/spam; IP-based abuse prevention.
- **Chat content (per press):** "오늘도 버틴다" ("getting through another day"), "퇴근하고 싶다" ("I want to go home"), "저도 팀장 때문에 죽겠어요" ("my team lead is killing me too") — answered by chains of "저도요" ("me too").
- **Creator:** an individual who announced it on **LinkedIn, Nov 2025**: "If you ever envied smokers' legitimate break time, now enjoy online damta — it's not even bad for your health." Never named in press. A LinkedIn post by designer **고서진 (Seojin Ko)** matches the timing — unconfirmed lead.
- **Usage:** ~20,000–30,000 daily visitors, 400+ concurrent (developer-claimed via Newsis/Money Today; a "DAU 130,000" figure in Newsis is internally inconsistent — distrust it). Snapshot: 18,355 virtual cigarette butts in one day.
- **Positioning:** NOT a smoking-cessation tool. It's a workplace-fairness joke made real — "why do only smokers get breaks?" (Korean labor guidance treats smoke breaks as paid time, fueling the resentment.) Audience is non-smokers who want a sanctioned ritual break, not quitters.

### 2.3 거지맵.com — "Beggar Map" (adjacent, not a simulator)

- Crowdsourced map of ultra-cheap (₩1,000–10,000) restaurants + frugality-tip community. Built by **최성수 (Choi Sung-soo), ~35**, laid-off, high-school graduate, former 거지방 participant — the only fully identified and properly interviewed builder. Launched Mar 20, 2026; **940,000 cumulative users in 18 days, peak 250,000+/day** (ZDNet Korea). Refuses monetization despite inbound ad offers ("유료화는 생각하지 않고 있다"). Korean press consistently groups it with the other two as one "ultralight empathy community" wave.

### 2.4 What does NOT exist (verified absences)

- No standalone fake *shopping/e-commerce* site — NEXTA's "fill shopping carts" line describes the delivery app. **nada's shopping ritual has no Korean (or Western) incumbent.**
- No fake doomscroll feed service found.
- No fake-shopping app predating 음식만안와요 found.
- No smoking-cessation tie-ins; no government program connections.

---

## 3. Who builds them

Solo individuals, not companies. A 21-year-old student with a delivery addiction; an unnamed developer (possibly a designer) shipping a LinkedIn side project; a laid-off 35-year-old non-CS-degree builder. **No startups, no studios, no VC/angel funding found anywhere in the category.** Creators market through personal social accounts with strong in-character humor; press came to them, not vice versa.

## 4. How they're monetized

| Site | Model |
|---|---|
| 음식만안와요.com | **Google AdSense only** (publisher tag `ca-pub-6184083010691370` confirmed in page source). No premium, no donations. |
| damta.world | **Google AdSense only** (separate account, `ca-pub-6962006868335508`, confirmed in source). Site states "completely free." |
| 거지맵.com | **Nothing.** Creator publicly refuses monetization despite inbound ad-partnership offers. |

No Buy-Me-a-Coffee/Toss 후원 buttons, no premium tiers, no B2B wellness deals anywhere. No revenue figures published. Monetization in this category is essentially **unsolved/unattempted** — these are public-goods-style side projects.

## 5. How they're built

- **damta.world:** static HTML pages + a JS real-time chat app, served behind Cloudflare. IP-based abuse controls, automated content filtering.
- **음식만안와요.com:** client-side-rendered JS SPA on a Korean IDN domain, Naver SEO verification. Framework unverifiable via text-only fetch (no SSR markup).
- **거지맵.com:** fully client-rendered; stack unverifiable.
- Common traits: **no accounts, no backend state of consequence, mobile-first, free, single-purpose** — Korean press calls the pattern 초경량 공감 커뮤니티 ("ultralight empathy communities"). nada's no-backend localStorage MVP architecture is exactly category-consistent.

## 6. Audience and motivations

No formal user survey exists (flag: all demographics inferred from journalism). Documented users: 24–29-year-old students, jobseekers, junior office workers — the Korean "2030/MZ" cohort. Gender split unreported. Motivations, in order of documentation strength:

1. **Money under inflation** — food-service prices +24.7% in 5 years; Engel coefficient 30.4% (highest since 1994); food is 37.6% of youth living costs; "delivery fees are a waste" is the #1 reason for avoiding delivery apps (~42%, Hankook Research).
2. **Craving resistance as a game** — late-night fake ordering ("I don't end up ordering anything, but it relieves a little stress"), the 배달 참기 챌린지.
3. **Sanctioned micro-break ritual** — the non-smoker's "legal" pause from work/study.
4. **Loneliness relief via anonymous co-presence** — "It feels like I'm taking a break with someone… I somehow feel less lonely" (24-year-old student). Low-stakes connection without relationship burden.

## 7. Cultural lineage

The trend did not appear from nowhere; it's the web-app stage of a documented Korean frugality-as-content arc:

- **무지출 챌린지** (no-spend challenge, viral 2022) — zero-spend days as SNS content; 54.2% willing to participate (Embrain, secondhand).
- **거지방** ("beggar rooms," viral 2023) — KakaoTalk chats (500+ rooms by Apr 2023) where members report every expense and ask permission to spend; normalized self-mocking "beggar" identity → direct ancestor of 거지맵.
- **짠테크** — thrift as *displayed*, communal, humorous content rather than private shame.
- **도파밍/도파민 디톡스** — "dopamine farming" was a Trend Korea 2024 keyword; detox culture (phone-surrender cafés, temple stays) followed. The 2026 sites are an **inversion of detox: substitution** — harm-reduction dopamine, not abstinence.
- **Mukbang** — the vicarious-consumption precedent every Korean expert cites.
- Pre-2026 "cart-filling without buying" existed as an informal consumer behavior (장바구니에 담기만 하기) analyzed in behavioral-economics terms, but never as a named viral movement or product.

## 8. Reception and criticism

- **Sympathetic/explanatory:** Prof. 김헌식 (Jungwon Univ.) — mukbang-style vicarious satisfaction; comfort in "loose connection" without burdensome relationships. Prof. 최철 (Sookmyung) — popularity of a fake delivery app is "a bizarre phenomenon" evidencing inflation's psychological pressure.
- **Critical:** Prof. 진보래 (Joongbu Univ., Hankyung Apr 28) — these are "모조 사회성" (imitation sociality); analogy: as over-sterile environments weaken bodily immunity, "frictionless, safe communication can weaken humans' social immunity."
- **Unaddressed in all coverage:** whether rehearsing the craving loop *trains* rather than curbs it. No clinical/addiction-specialist commentary exists. The only counter-evidence is the creator's own anecdote that building the fake app killed her real delivery habit.
- **NEXTA framing accuracy:** mechanics accurate; framing partially inverted (Korean coverage = frugality/survival; NEXTA = dopamine novelty, economics dropped); scale implied bigger than documented. Not fabricated — named sites, named developers, national-TV interviews, analytics data points. But amplification-inflated: hundreds to low-tens-of-thousands of real users vs. millions of viral impressions.

## 9. Implications for nada

1. **Whitespace is real:** no fake-shopping simulator exists anywhere, including Korea; no Western equivalent of any of these sites was found. nada's flagship ritual is unclaimed.
2. **The category formula** (worth honoring): no signup, free, instant, mobile-first, single ritual, anonymous, humor-forward. Every Korean hit follows it; nada's MVP spec already does.
3. **Savings framing beats dopamine framing for users:** Korean users came for *money saved* (and calories) — the viral "dopamine" angle was a press invention. nada's money-saved hero stat is the right center of gravity; consider whether a second "saved" dimension (Korean version used calories) fits the US shopping ritual (e.g., clutter/items kept out of your home).
4. **Theater details that worked:** the post-payment fake courier ("rabbit rider") tracking was the most-screenshotted feature; in-character marketing (rider resignation letter) drove virality. nada's processing-theater intercept is analogous — the Korean evidence suggests *extending* theater past the intercept could deepen the payoff.
5. **The challenge dynamic emerged organically:** users turned the fake app into a streak game (배달 참기 챌린지) without the developer building it. nada building streaks in from day one is validated.
6. **Monetization is unsolved in-category:** AdSense or nothing. Nobody has tried premium, donations, or B2B wellness. Ads would undercut a wellness positioning; the field is open to define it.
7. **Co-presence is the second engine:** the smoke-break site's draw is anonymous "saving/suffering together." nada's MVP is solo; the saves-feed/social layer is where the Korean evidence points next (relevant to the coming-soon smoke-break ritual).
8. **Expect the criticism:** "imitation sociality" / "does rehearsing the ritual train the craving?" will be the substantive pushback. The open-simulator honesty in nada's spec and any future evidence of real behavior change are the defenses.

## 10. Confidence notes

**High confidence (multi-source, incl. primary):** the three sites' existence, features, flows; creators' profiles as described; AdSense-only monetization (read from page source); timeline; usage figures of 200–300/day (fake delivery) and ~20–30k/day (damta); the frugality-culture lineage; expert commentary.

**Flagged/unverified:** 박서현 = @malheeelife identity equivalence (very likely, unconfirmed); damta creator's identity (고서진 is a lead, not a confirmation); damta "DAU 130,000" (internally inconsistent — distrust); NEXTA tweet's "2M views" (unverifiable); exact launch date of 음식만안와요 (bounded to ≤Mar 2026); absence of big-three Korean daily coverage (absence not provable); all audience demographics (journalistic anecdote, no survey).

## Sources

**Korean primary/press:** [Hankook Ilbo 2026-05-25](https://www.hankookilbo.com/news/article/A2026052116520004512) · [MBC 뉴스투데이 2026-04-21](https://imnews.imbc.com/replay/2026/nwtoday/article/6816760_37012.html) · [MBC 뉴스데스크](https://imnews.imbc.com/replay/2026/nwdesk/article/6816695_37004.html) · [머니투데이 2026-04-22](https://www.mt.co.kr/society/2026/04/22/2026042208385329222) · [머니투데이/Daum 2026-04-13](https://v.daum.net/v/VC6UZ1gRct) · [한국경제 2026-04-28](https://www.hankyung.com/article/202604283029g) · [파이낸셜뉴스 2026-04-12](https://www.fnnews.com/news/202604121233484976) · [Newsis/Daum 2026-04-08](https://v.daum.net/v/20260408071428178) · [Kormedi 2026-03-25](https://kormedi.com/2801182/) · [News1 거지맵 인터뷰](https://v.daum.net/v/20260331060153465) · [ZDNet Korea 거지맵](https://zdnet.co.kr/view/?no=20260407173736) · [Korea Daily 거지맵](https://www.koreadaily.com/article/20260423130054844)

**Sites (fetched firsthand):** [damta.world](https://www.damta.world/) · [음식만안와요.com](https://www.xn--lz2bv9nd1bm2a9lo9a.com/) · [거지맵.com](https://xn--v69ak0xskm.com/)

**Creator posts:** [말희 launch tweet](https://x.com/malheeelife/status/2036816950639403160) · [rider resignation letter](https://x.com/malheeelife/status/2039537133233582461) · [PWA install thread](https://x.com/malheeelife/status/2038547051139702899) · [고서진 LinkedIn (unconfirmed lead)](https://kr.linkedin.com/posts/seojin-ko-designer_%EC%98%A8%EB%9D%BC%EC%9D%B8%EB%8B%B4%ED%83%80-activity-7398000837907705856-lNKS)

**English:** [Korea Times 2026-05-27](https://www.koreatimes.co.kr/lifestyle/trends/20260527/gen-z-turn-to-dopamine-sites-for-quick-comfort) · [SCMP 2026-05-27](https://www.scmp.com/news/asia/east-asia/article/3354966/south-koreas-lonely-stressed-gen-z-find-comfort-apps-do-nothing) · [NEXTA tweet 2026-06-06](https://x.com/nexta_tv/status/2063252892199325983) · [ThePrint 2026-06-09](https://theprint.in/feature/young-south-koreans-burnout-loneliness-anxiety/2955246/) · [LI Solutions 2026-06-09](https://li.solutions/blog/dopamine-sites-product-lesson/) · [Insight Trends World](https://www.insighttrendsworld.com/post/simulated-comfort-culture-dopamine-sites-are-turning-fake-digital-rituals-into-emotional-self-soo)

**Cultural background:** [경향신문 거지방 2023](https://www.khan.co.kr/article/202304141545011) · [YTN 거지방](https://www.ytn.co.kr/_ln/0103_202304171949457701) · [한국경제 도파민 단식 2024](https://www.hankyung.com/article/2024062504667) · [뉴시스 도파민 디톡스 2025](https://mobile.newsis.com/view/NISX20250123_0003044035) · [한국리서치 배달앱 조사](https://hrcopinion.co.kr/archives/21353) · [FM Korea 바이럴 스레드](https://www.fmkorea.com/best/9637875746)
