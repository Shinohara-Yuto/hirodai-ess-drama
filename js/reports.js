function createReportCard(report, isLatest) {
  const article = document.createElement("article");
  article.className = `report-card reveal${isLatest ? " report-card--latest" : ""}`;

  const title = asPlainText(report.title, 200);
  const photo = safeImagePath(asPlainText(report.photo, 240));
  if (photo) {
    const figure = document.createElement("figure");
    figure.className = "report-photo";
    const img = document.createElement("img");
    img.src = photo;
    img.alt = `${title}の集合写真`;
    img.loading = "lazy";
    figure.appendChild(img);
    article.appendChild(figure);
  }

  const body = document.createElement("div");
  body.className = "report-body";
  if (isLatest) {
    const badge = document.createElement("span");
    badge.className = "report-latest-badge";
    badge.textContent = "Latest";
    body.appendChild(badge);
  }

  const meta = document.createElement("div");
  meta.className = "report-meta";
  const time = document.createElement("time");
  time.className = "report-date";
  const date = asPlainText(report.date, 20);
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) time.dateTime = date;
  time.textContent = asPlainText(report.dateLabel || report.date, 40);
  meta.appendChild(time);

  const heading = document.createElement("h2");
  heading.className = "report-title";
  heading.textContent = title;

  const details = document.createElement("dl");
  details.className = "report-details";

  const authorRow = document.createElement("div");
  authorRow.className = "report-detail";
  const authorTerm = document.createElement("dt");
  authorTerm.textContent = "担当者";
  const authorValue = document.createElement("dd");
  authorValue.className = "report-author";
  authorValue.textContent = asPlainText(report.author, 80) || "活動報告担当";
  authorRow.append(authorTerm, authorValue);

  const commentRow = document.createElement("div");
  commentRow.className = "report-detail";
  const commentTerm = document.createElement("dt");
  commentTerm.textContent = "活動報告";
  const commentValue = document.createElement("dd");
  commentValue.className = "report-comment";
  commentValue.textContent = asPlainText(report.comment || report.body, 4000);
  commentRow.append(commentTerm, commentValue);

  details.append(authorRow, commentRow);
  body.append(meta, heading, details);
  article.appendChild(body);
  return article;
}

async function loadReports() {
  const list = document.getElementById("reports-list");
  const intervalEl = document.getElementById("reports-site-update");
  if (!list) return;

  try {
    const response = await fetch("data/reports.json");
    if (!response.ok) throw new Error("reports.json not found");
    const data = await response.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("reports.json is invalid");
    }
    const reports = (Array.isArray(data.reports) ? data.reports : [])
      .filter((report) => report && typeof report === "object")
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (intervalEl && data.siteUpdateInterval) {
      intervalEl.textContent = asPlainText(data.siteUpdateInterval, 80).replace("ホームページ更新：", "");
    }

    if (reports.length === 0) {
      list.replaceChildren();
      const empty = document.createElement("p");
      empty.className = "report-text";
      empty.textContent = "活動報告は準備中です。次回の金曜アクト後に更新予定です。";
      list.appendChild(empty);
      return;
    }

    reports.forEach((report, index) => {
      list.appendChild(createReportCard(report, index === 0));
    });

    document.querySelectorAll(".report-card").forEach((el) => {
      if (typeof IntersectionObserver !== "undefined") {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) entry.target.classList.add("visible");
            });
          },
          { threshold: 0.1 }
        );
        observer.observe(el);
      } else {
        el.classList.add("visible");
      }
    });
  } catch (error) {
    console.error(error);
    list.replaceChildren();
    const message = document.createElement("p");
    message.className = "report-text";
    message.textContent = "活動報告を読み込めませんでした。";
    list.appendChild(message);
  }
}

document.addEventListener("DOMContentLoaded", loadReports);
