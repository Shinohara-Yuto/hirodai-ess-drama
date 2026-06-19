const GRADE_LABELS = {
  1: "1年生",
  2: "2年生",
  3: "3年生",
};

function photoPath(photoNumber) {
  if (!photoNumber) return null;
  return `assets/members/photo ${photoNumber}.jpg`;
}

function normalizeOtherByGrade(data) {
  if (data.otherByGrade && Object.keys(data.otherByGrade).length > 0) {
    return Object.fromEntries(
      Object.entries(data.otherByGrade).map(([grade, count]) => [Number(grade), Number(count)])
    );
  }
  if (data.otherCount > 0) {
    return { 1: data.otherCount };
  }
  return {};
}

function createOtherMemberCard(grade) {
  const card = document.createElement("article");
  card.className = "member-card member-card--other reveal";
  card.innerHTML = `
    <div class="member-photo member-photo--placeholder member-photo--other">
      <span aria-hidden="true">+1</span>
    </div>
    <div class="member-body">
      <span class="member-grade-badge">${GRADE_LABELS[grade] || ""}</span>
      <h3 class="member-name">他一名</h3>
      <p class="member-message">個別紹介は掲載していません。</p>
    </div>
  `;
  return card;
}

function createMemberCard(member) {
  const card = document.createElement("article");
  card.className = "member-card reveal";

  const photoSrc = photoPath(member.photo);
  const altText = member.name || `ESSメンバー photo ${member.photo}`;
  const photoHtml = photoSrc
    ? `<img src="${photoSrc}" alt="${escapeHtml(altText)}" loading="lazy" onerror="this.closest('.member-photo').classList.add('member-photo--placeholder'); this.replaceWith(Object.assign(document.createElement('span'), { textContent: 'ESS', ariaHidden: true }));">`
    : `<span aria-hidden="true">ESS</span>`;

  const nameHtml = member.name
    ? `<h3 class="member-name">${escapeHtml(member.name)}</h3>`
    : `<h3 class="member-name member-name--empty">名前未設定</h3>`;

  const metaParts = [];
  if (member.faculty) metaParts.push(escapeHtml(member.faculty));
  if (member.hometown) metaParts.push(escapeHtml(member.hometown));
  const metaHtml = metaParts.length
    ? `<p class="member-meta">${metaParts.join(" ／ ")}</p>`
    : "";

  const hobbyHtml = member.hobby
    ? `<p class="member-message">${escapeHtml(member.hobby)}</p>`
    : "";

  card.innerHTML = `
    <div class="member-photo${photoSrc ? "" : " member-photo--placeholder"}">
      ${photoHtml}
    </div>
    <div class="member-body">
      <span class="member-grade-badge">${GRADE_LABELS[member.grade] || ""}</span>
      ${nameHtml}
      ${metaHtml}
      ${hobbyHtml}
    </div>
  `;

  return card;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function updateSummaryCounts(counts, otherByGrade = {}) {
  if (!counts) return;

  const otherTotal = Object.values(otherByGrade).reduce((sum, count) => sum + count, 0);
  const gradeOther = (grade) => otherByGrade[grade] || 0;

  [
    ["grade-3", counts.grade3, 3],
    ["grade-2", counts.grade2, 2],
    ["grade-1", counts.grade1, 1],
  ].forEach(([id, count, grade]) => {
    const section = document.getElementById(id);
    if (!section) return;
    const countEl = section.querySelector(".members-count");
    const extraOther = gradeOther(grade);
    if (countEl) {
      countEl.textContent = extraOther > 0 ? `${count}名＋他${extraOther}名` : `${count}名`;
    }
  });

  document.querySelectorAll(".summary-chip").forEach((chip) => {
    const text = chip.textContent;
    if (text.includes("3年生") && counts.grade3 != null) {
      chip.innerHTML = `3年生 <strong>${counts.grade3}</strong>名`;
    } else if (text.includes("2年生") && counts.grade2 != null) {
      const suffix = gradeOther(2) > 0 ? `＋他${gradeOther(2)}` : "";
      chip.innerHTML = `2年生 <strong>${counts.grade2}</strong>名${suffix}`;
    } else if (text.includes("1年生") && counts.grade1 != null) {
      const suffix = gradeOther(1) > 0 ? `＋他${gradeOther(1)}` : "";
      chip.innerHTML = `1年生 <strong>${counts.grade1}</strong>名${suffix}`;
    } else if (chip.classList.contains("summary-chip--total") && counts.total != null) {
      const listed = counts.listed ?? counts.total - otherTotal;
      chip.innerHTML =
        otherTotal > 0
          ? `紹介 <strong>${listed}</strong>名＋他<strong>${otherTotal}</strong>名`
          : `合計 <strong>${counts.total}</strong>名`;
    }
  });

  const leadEl = document.querySelector(".members-hero-lead");
  if (leadEl && counts.total != null) {
    const listed = counts.listed ?? counts.total - otherTotal;
    leadEl.textContent =
      otherTotal > 0
        ? `広島大学 ESS ドラマセクションの${listed}名を紹介（他${otherTotal}名）。公演・練習・イベント、全部がESSドラマの日常です。`
        : `広島大学 ESS ドラマセクションの${counts.total}人。公演・練習・イベント、全部がESSドラマの日常です。`;
  }
}

async function loadMembers() {
  const containers = {
    1: document.getElementById("members-grade-1"),
    2: document.getElementById("members-grade-2"),
    3: document.getElementById("members-grade-3"),
  };

  try {
    const response = await fetch("data/members.json");
    if (!response.ok) throw new Error("members.json not found");
    const data = await response.json();
    const members = data.members || [];
    const otherByGrade = normalizeOtherByGrade(data);

    updateSummaryCounts(data.counts, otherByGrade);

    Object.values(containers).forEach((el) => {
      if (el) el.innerHTML = "";
    });

    members.forEach((member) => {
      const container = containers[member.grade];
      if (!container) return;
      container.appendChild(createMemberCard(member));
    });

    Object.entries(otherByGrade).forEach(([grade, count]) => {
      const container = containers[Number(grade)];
      if (!container) return;
      for (let i = 0; i < count; i += 1) {
        container.appendChild(createOtherMemberCard(Number(grade)));
      }
    });

    document.querySelectorAll(".member-card").forEach((el) => {
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
    Object.values(containers).forEach((el) => {
      if (el) {
        el.innerHTML = '<p class="member-message">メンバー情報を読み込めませんでした。</p>';
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", loadMembers);
