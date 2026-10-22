const GRADE_LABELS = {
  1: "1年生",
  2: "2年生",
  3: "3年生",
};

function photoPath(photoNumber) {
  const n = asCount(photoNumber);
  if (!n) return "";
  return safeImagePath(`assets/members/photo ${n}.jpg`);
}

function normalizeOtherByGrade(data) {
  if (data.otherByGrade && typeof data.otherByGrade === "object") {
    return Object.fromEntries(
      Object.entries(data.otherByGrade)
        .map(([grade, count]) => [asCount(grade), asCount(count)])
        .filter(([grade, count]) => grade >= 1 && grade <= 3 && count > 0)
    );
  }
  const otherCount = asCount(data.otherCount);
  if (otherCount > 0) {
    return { 1: otherCount };
  }
  return {};
}

function createOtherMemberCard(grade) {
  const card = document.createElement("article");
  card.className = "member-card member-card--other reveal";

  const photo = document.createElement("div");
  photo.className = "member-photo member-photo--placeholder member-photo--other";
  const mark = document.createElement("span");
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = "+1";
  photo.appendChild(mark);

  const body = document.createElement("div");
  body.className = "member-body";
  const badge = document.createElement("span");
  badge.className = "member-grade-badge";
  badge.textContent = GRADE_LABELS[grade] || "";
  const name = document.createElement("h3");
  name.className = "member-name";
  name.textContent = "他一名";
  const message = document.createElement("p");
  message.className = "member-message";
  message.textContent = "個別紹介は掲載していません。";
  body.append(badge, name, message);

  card.append(photo, body);
  return card;
}

function createMemberCard(member) {
  const card = document.createElement("article");
  card.className = "member-card reveal";
  const grade = asCount(member.grade);
  const nameText = asPlainText(member.name, 80);
  const photoSrc = photoPath(member.photo);

  const photo = document.createElement("div");
  photo.className = "member-photo";
  if (photoSrc) {
    const img = document.createElement("img");
    img.src = photoSrc;
    img.alt = nameText || `ESSメンバー photo ${asCount(member.photo)}`;
    img.loading = "lazy";
    img.addEventListener("error", () => {
      photo.classList.add("member-photo--placeholder");
      const span = document.createElement("span");
      span.setAttribute("aria-hidden", "true");
      span.textContent = "ESS";
      img.replaceWith(span);
    });
    photo.appendChild(img);
  } else {
    photo.classList.add("member-photo--placeholder");
    const span = document.createElement("span");
    span.setAttribute("aria-hidden", "true");
    span.textContent = "ESS";
    photo.appendChild(span);
  }

  const body = document.createElement("div");
  body.className = "member-body";
  const badge = document.createElement("span");
  badge.className = "member-grade-badge";
  badge.textContent = GRADE_LABELS[grade] || "";
  const name = document.createElement("h3");
  name.className = nameText ? "member-name" : "member-name member-name--empty";
  name.textContent = nameText || "名前未設定";
  body.append(badge, name);

  const faculty = asPlainText(member.faculty, 80);
  if (faculty) {
    const meta = document.createElement("p");
    meta.className = "member-meta";
    meta.textContent = faculty;
    body.appendChild(meta);
  }

  const hobby = asPlainText(member.hobby, 400);
  if (hobby) {
    const message = document.createElement("p");
    message.className = "member-message";
    message.textContent = hobby;
    body.appendChild(message);
  }

  card.append(photo, body);
  return card;
}

function fillChip(chip, parts) {
  chip.replaceChildren();
  parts.forEach((part) => {
    if (typeof part === "number") {
      const strong = document.createElement("strong");
      strong.textContent = String(part);
      chip.appendChild(strong);
      return;
    }
    chip.append(part);
  });
}

function updateSummaryCounts(counts, otherByGrade = {}) {
  if (!counts || typeof counts !== "object") return;

  const otherTotal = Object.values(otherByGrade).reduce((sum, count) => sum + asCount(count), 0);
  const gradeOther = (grade) => asCount(otherByGrade[grade]);
  const gradeCounts = {
    3: asCount(counts.grade3),
    2: asCount(counts.grade2),
    1: asCount(counts.grade1),
  };

  [
    ["grade-3", 3],
    ["grade-2", 2],
    ["grade-1", 1],
  ].forEach(([id, grade]) => {
    const section = document.getElementById(id);
    if (!section) return;
    const countEl = section.querySelector(".members-count");
    const extraOther = gradeOther(grade);
    if (countEl) {
      countEl.textContent = extraOther > 0 ? `${gradeCounts[grade]}名＋他${extraOther}名` : `${gradeCounts[grade]}名`;
    }
  });

  document.querySelectorAll(".summary-chip").forEach((chip) => {
    const text = chip.textContent;
    if (text.includes("3年生") && counts.grade3 != null) {
      fillChip(chip, ["3年生 ", gradeCounts[3], "名"]);
    } else if (text.includes("2年生") && counts.grade2 != null) {
      const suffix = gradeOther(2) > 0 ? `＋他${gradeOther(2)}` : "";
      fillChip(chip, ["2年生 ", gradeCounts[2], `名${suffix}`]);
    } else if (text.includes("1年生") && counts.grade1 != null) {
      const suffix = gradeOther(1) > 0 ? `＋他${gradeOther(1)}` : "";
      fillChip(chip, ["1年生 ", gradeCounts[1], `名${suffix}`]);
    } else if (chip.classList.contains("summary-chip--total") && counts.total != null) {
      const total = asCount(counts.total);
      const listed = counts.listed == null ? Math.max(0, total - otherTotal) : asCount(counts.listed);
      fillChip(
        chip,
        otherTotal > 0
          ? ["紹介 ", listed, "名＋他", otherTotal, "名"]
          : ["合計 ", total, "名"]
      );
    }
  });

  const leadEl = document.querySelector(".members-hero-lead");
  if (leadEl && counts.total != null) {
    const total = asCount(counts.total);
    const listed = counts.listed == null ? Math.max(0, total - otherTotal) : asCount(counts.listed);
    leadEl.textContent =
      otherTotal > 0
        ? `広島大学 ESS ドラマセクションの${listed}名を紹介（他${otherTotal}名）。公演・練習・イベント、全部がESSドラマの日常です。`
        : `広島大学 ESS ドラマセクションの${total}人。公演・練習・イベント、全部がESSドラマの日常です。`;
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
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("members.json is invalid");
    }
    const members = Array.isArray(data.members) ? data.members : [];
    const otherByGrade = normalizeOtherByGrade(data);

    updateSummaryCounts(data.counts, otherByGrade);

    Object.values(containers).forEach((el) => {
      if (el) el.replaceChildren();
    });

    members.forEach((member) => {
      if (!member || typeof member !== "object") return;
      const grade = asCount(member.grade);
      const container = containers[grade];
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
      if (!el) return;
      el.replaceChildren();
      const message = document.createElement("p");
      message.className = "member-message";
      message.textContent = "メンバー情報を読み込めませんでした。";
      el.appendChild(message);
    });
  }
}

document.addEventListener("DOMContentLoaded", loadMembers);
