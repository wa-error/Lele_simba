// بيانات الأفراد والأيام (الأحد = 0)
const schedule = [
  { name: 'عزوز', day: 0 },
  { name: 'مرام', day: 1 },
  { name: 'سحر', day: 2 },
  { name: 'بشاير', day: 3 },
];


// العقوبة الأسبوعية
const weeklyPenalty = "اللعب مع ليلي وسيمبا لمدة نصف ساعة أو شراء ألعاب أو أكل أو رمل لليلي وسيمبا لا يقل سعرها عن 100 ريال";


// إعداد localStorage keys
const LS_CONFIRMATIONS_KEY = 'confirmations';
const LS_PENALTIES_KEY = 'penalties';


// تحميل البيانات من localStorage أو إنشاء جديد
let confirmations = JSON.parse(localStorage.getItem(LS_CONFIRMATIONS_KEY)) || {};
let penalties = JSON.parse(localStorage.getItem(LS_PENALTIES_KEY)) || [];


// تاريخ بداية الأسبوع (أول يوم الأحد الساعة 00:00) - توقيت السعودية UTC+3
function getRiyadhNow() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + 3 * 3600000);
}


// بداية الأسبوع الأحد الساعة 00:00 بتوقيت الرياض
function getWeekStart() {
  const now = getRiyadhNow();
  const day = now.getDay(); // 0=أحد
  const diffToSunday = -day;
  const sunday = new Date(now);
  sunday.setHours(8, 0, 0, 0);
  sunday.setDate(sunday.getDate() + diffToSunday);
  return sunday;
}


// تحويل رقم اليوم إلى اسم عربي
function getDayName(dayNum) {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[dayNum] || '';
}


// التحقق من فترة التمشيط (من 5 مساءً حتى 7:30 صباح اليوم التالي) بتوقيت الرياض
function isInBrushingTime() {
  const now = getRiyadhNow();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  if (hour > 17) return true;
  if (hour < 7) return true;
  if (hour === 7 && minutes <= 30) return true;
  return false;
}


// حفظ البيانات في localStorage
function saveData() {
  localStorage.setItem(LS_CONFIRMATIONS_KEY, JSON.stringify(confirmations));
  localStorage.setItem(LS_PENALTIES_KEY, JSON.stringify(penalties));
}


// إضافة عقوبة جديدة
function addPenalty(name, reason) {
  const now = new Date();
  const date = now.toLocaleDateString('ar-EG');
  if (!penalties.find(p => p.name === name && p.date === date)) {
    penalties.push({ name, reason, date, executed: false });
    saveData();
    renderPenalties();
  }
}


// عرض سجل العقوبات
function renderPenalties() {
  const penaltyList = document.getElementById('penalty-list');
  penaltyList.innerHTML = `<h3>سجل العقوبات</h3>`;
  if (penalties.length === 0) {
    penaltyList.innerHTML += `<p>لا توجد عقوبات مسجلة حتى الآن.</p>`;
    return;
  }


  penalties.forEach((penalty, index) => {
    const div = document.createElement('div');
    div.className = 'penalty-item';
    let html = `${penalty.date} - ${penalty.name}: ${penalty.reason} - `;
    if (!penalty.executed) {
      html += `<button onclick="executePenalty(${index})">تنفيذ العقاب</button>`;
    } else {
      html += `تم التنفيذ ✅`;
    }
    div.innerHTML = html;
    penaltyList.appendChild(div);
  });
}


// تنفيذ العقوبة
function executePenalty(index) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = () => {
    penalties[index].executed = true;
    saveData();
    renderPenalties();
  };
  input.click();
}


// تأكيد التمشيط مع رفع صورتين
function confirmBrushing(name, day) {
  if (!isInBrushingTime()) {
    alert('يمكنك التأكيد فقط من الساعة 5 مساءً حتى 7:30 صباحًا بتوقيت الرياض.');
    return;
  }


  const confirmKey = `${name}-${getWeekStart().toISOString().slice(0, 10)}`;
  if (confirmations[confirmKey]) {
    alert('لقد أكدت التمشيط لهذا الأسبوع مسبقاً.');
    return;
  }


  const input1 = document.createElement('input');
  input1.type = 'file';
  input1.accept = 'image/*';
  input1.onchange = () => {
    const input2 = document.createElement('input');
    input2.type = 'file';
    input2.accept = 'image/*';
    input2.onchange = () => {
      confirmations[confirmKey] = true;
      penalties = penalties.filter(p => p.name !== name);
      saveData();
      renderTable();
      renderPenalties();
      alert('تم تأكيد التمشيط بنجاح.');
    };
    input2.click();
  };
  input1.click();
}


// توليد جدول التمشيط
function renderTable() {
  const tbody = document.querySelector('#schedule-table tbody');
  tbody.innerHTML = '';
  const weekStart = getWeekStart();
  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(weekStart);
    currentDay.setDate(weekStart.getDate() + i);
    const sched = schedule.find(s => s.day === i % schedule.length);
    const name = sched ? sched.name : '-';
    const confirmKey = sched ? `${sched.name}-${weekStart.toISOString().slice(0, 10)}` : null;
    const confirmed = confirmKey ? (confirmations[confirmKey] === true) : false;
    const today = getRiyadhNow();
    const currentDayStart = new Date(currentDay);
currentDayStart.setHours(8, 0, 0, 0); // بداية اليوم 8 صباحًا بتوقيت الرياض

const nextDayStart = new Date(currentDayStart);
nextDayStart.setDate(nextDayStart.getDate() + 1); // بداية اليوم التالي 8 صباحًا

const isToday = today >= currentDayStart && today < nextDayStart;


    const tr = document.createElement('tr');
    const tdDay = document.createElement('td');
    tdDay.textContent = getDayName(i);
    tr.appendChild(tdDay);


    const tdName = document.createElement('td');
    tdName.textContent = name;
    tr.appendChild(tdName);


    const tdStatus = document.createElement('td');
    tdStatus.classList.add('status');


    const tdConfirm = document.createElement('td');


    if (confirmed) {
      tdStatus.textContent = 'تم التمشيط';
      tdStatus.classList.add('active');
      const btn = document.createElement('button');
      btn.textContent = 'عرض الصور';
      tdConfirm.appendChild(btn);
    } else if (sched && isToday) {
      tdStatus.textContent = 'في الانتظار';
      const btn = document.createElement('button');
      btn.textContent = 'تأكيد التمشيط';
      btn.className = 'confirm-btn';
      btn.disabled = !isInBrushingTime();
      btn.onclick = () => confirmBrushing(name, i);
      tdConfirm.appendChild(btn);
    } else if (sched && !isToday && today > currentDay) {
      tdStatus.textContent = 'لم يتم التمشيط';
      tdStatus.classList.add('late');
      if (!penalties.some(p => p.name === sched.name)) {
        addPenalty(sched.name, weeklyPenalty);
      }
      const btn = document.createElement('button');
      btn.textContent = '❌';
      btn.onclick = () => {
        confirmBrushing(name, i);
      };
      tdConfirm.appendChild(btn);
    } else {
      tdStatus.textContent = '-';
    }


    tr.appendChild(tdStatus);
    tr.appendChild(tdConfirm);
    tbody.appendChild(tr);
  }
}


// تشغيل البرنامج
function init() {
  renderTable();
  renderPenalties();
}


init();


