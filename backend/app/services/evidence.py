import json
from urllib.error import URLError, HTTPError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

USER_AGENT = "InochiTutor/0.1 (anatomy education; https://localhost)"


def _get_json(url: str, timeout: float = 7.0) -> dict:
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    with urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def _safe_get(url: str) -> dict:
    try:
        return _get_json(url)
    except (URLError, HTTPError, TimeoutError, json.JSONDecodeError, ValueError):
        return {}


def gather_evidence(
    question: str,
    selected_part: str | None = None,
    module_title: str | None = None,
) -> tuple[list[dict], list[dict]]:
    topic = " ".join(part for part in (selected_part, module_title, question) if part).strip()
    if not topic:
        topic = "human anatomy"
    papers = search_pubmed(topic)
    images = search_wikipedia_images(topic)
    return papers, images


def search_pubmed(topic: str, limit: int = 3) -> list[dict]:
    term = f"({topic}) AND (anatomy OR physiology OR review)"
    search = _safe_get(
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?"
        + urlencode(
            {
                "db": "pubmed",
                "retmode": "json",
                "retmax": str(limit),
                "sort": "relevance",
                "term": term,
                "tool": "inochi",
            }
        )
    )
    ids = (search.get("esearchresult") or {}).get("idlist") or []
    if not ids:
        return []

    summary = _safe_get(
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?"
        + urlencode(
            {
                "db": "pubmed",
                "retmode": "json",
                "id": ",".join(ids),
                "tool": "inochi",
            }
        )
    )
    result = summary.get("result") or {}
    papers: list[dict] = []
    for pmid in ids:
        item = result.get(pmid)
        if not isinstance(item, dict):
            continue
        authors = item.get("authors") or []
        author_names = [str(author.get("name", "")).strip() for author in authors if author.get("name")]
        lead = author_names[0] if author_names else "Unknown"
        year = str(item.get("pubdate") or "")[:4]
        papers.append(
            {
                "title": str(item.get("title") or "Untitled").strip(),
                "authors": ", ".join(author_names[:4]) + (" et al." if len(author_names) > 4 else ""),
                "year": year,
                "venue": str(item.get("source") or "PubMed").strip(),
                "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                "source": "PubMed",
                "lead": lead,
            }
        )
    return papers[:limit]


def search_wikipedia_images(topic: str, limit: int = 3) -> list[dict]:
    query = f"{topic} anatomy"
    search = _safe_get(
        "https://en.wikipedia.org/w/api.php?"
        + urlencode(
            {
                "action": "query",
                "list": "search",
                "srsearch": query,
                "srlimit": str(limit),
                "format": "json",
            }
        )
    )
    hits = (search.get("query") or {}).get("search") or []
    images: list[dict] = []
    for hit in hits:
        title = str(hit.get("title") or "").strip()
        if not title:
            continue
        summary = _safe_get(f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(title)}")
        thumb = (summary.get("thumbnail") or {}).get("source")
        original = (summary.get("originalimage") or {}).get("source") or thumb
        if not original:
            continue
        page = ((summary.get("content_urls") or {}).get("desktop") or {}).get("page")
        images.append(
            {
                "url": original,
                "thumb_url": thumb or original,
                "caption": str(summary.get("title") or title),
                "alt": str(summary.get("description") or summary.get("extract") or title)[:180],
                "source": "Wikipedia",
                "source_url": page or f"https://en.wikipedia.org/wiki/{quote(title.replace(' ', '_'))}",
                "license": "Wikipedia / Wikimedia Commons",
            }
        )
        if len(images) >= limit:
            break
    return images
