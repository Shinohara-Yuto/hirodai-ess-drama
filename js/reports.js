function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function createReportCard(report, isLatest) {
  const article = document.createElement("article");
  article.className = `report-card reveal${isLatest ? " report-card--latest" : ""}`;

  const badge = isLatest ? `<span class="report-latest-badge">Latest</span>` : "";
  const photoHtml = report.photo
    ? `<img src="${report.photo}" alt="${escapeHtml(report.title)}の集合写真" loading="lazy">`
    : "";

  article.innerHTML = `
    ${report.photo ? `<figure class="report-photo">${photoHtml}</figure>` : ""}
    <div class="report-body">
      ${badge}
      <div class="report-meta">
        <time class="report-date" datetime="${report.date}">${escapeHtml(report.dateLabel || report.date)}</time>
      </div>
      <h2 class="report-title">${escapeHtml(report.title)}</h2>
      <dl class="report-details">
        <div class="report-detail">
          <dt>担当者</dt>
          <dd class="report-author">${escapeHtml(report.author || "活動報告担当")}</dd>
        </div>
        <div class="report-detail">
          <dt>コメント</dt>
          <dd class="report-comment">${escapeHtml(report.comment || report.body || "")}</dd>
        </div>
      </dl>
    </div>
  `;

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
    const reports = (data.reports || []).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    if (intervalEl && data.siteUpdateInterval) {
      intervalEl.textContent = data.siteUpdateInterval.replace("ホームページ更新：", "");
    }

    if (reports.length === 0) {
      list.innerHTML = '<p class="report-text">活動報告は準備中です。次回の金曜アクト後に更新予定です。</p>';
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
    list.innerHTML = '<p class="report-text">活動報告を読み込めませんでした。</p>';
  }
}

document.addEventListener("DOMContentLoaded", loadReports);
