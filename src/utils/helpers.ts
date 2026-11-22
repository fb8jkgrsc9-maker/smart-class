import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AttendanceRecord, ClassroomState, Student, Team } from '../types/classroom';

export function formatStudentPrimary(student: Student): string {
  return student.displayName;
}

export function formatStudentMeta(student: Student): string {
  const parts: string[] = [];
  if (student.chineseName && !student.displayName.includes(student.chineseName)) {
    parts.push(student.chineseName);
  }
  if (student.pinyin) {
    parts.push(student.pinyin);
  }
  if (student.englishName && !student.displayName.includes(student.englishName)) {
    parts.push(student.englishName);
  }
  return parts.join(' · ');
}

export function getTeamTotalScore(team: Team, students: Student[]): number {
  const memberPoints = students
    .filter((s) => s.active && s.teamId === team.id)
    .reduce((sum, s) => sum + s.points, 0);
  return memberPoints + team.bonusPoints;
}

export function getStudentAttendanceStats(studentId: string, history: AttendanceRecord[]) {
  let present = 0;
  let late = 0;
  let excused = 0;
  let absent = 0;
  history.forEach((day) => {
    const st = day.records[studentId];
    if (st === 'present') present++;
    else if (st === 'late') late++;
    else if (st === 'excused') excused++;
    else if (st === 'absent') absent++;
  });
  const total = present + late + excused + absent;
  const rate = total === 0 ? 100 : Math.round(((present + late * 0.8 + excused * 0.5) / total) * 100);
  return { present, late, excused, absent, total, rate };
}

export function speakChinese(text: string): { ok: boolean; reason?: string } {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return { ok: false, reason: 'Speech synthesis is not supported in this browser.' };
  }
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-CN';
    utter.rate = 0.88;
    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find((v) => v.lang.toLowerCase().startsWith('zh'));
    if (zhVoice) utter.voice = zhVoice;
    window.speechSynthesis.speak(utter);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'Unable to play pronunciation audio.' };
  }
}

export function exportClassroomExcel(state: ClassroomState) {
  const wb = XLSX.utils.book_new();

  const studentRows = state.students.map((s) => {
    const team = state.teams.find((t) => t.id === s.teamId);
    const att = getStudentAttendanceStats(s.id, state.attendanceHistory);
    return {
      No: s.orderIndex,
      ID: s.studentNumber,
      SuppliedName: s.displayName,
      ChineseName: s.chineseName || '-',
      Pinyin: s.pinyin || '-',
      EnglishName: s.englishName || '-',
      Team: team?.name || '-',
      Points: s.points,
      AttendanceRate: `${att.rate}%`,
      PresentDays: att.present,
      LateDays: att.late,
      ExcusedDays: att.excused,
      AbsentDays: att.absent,
      CleaningEligible: s.excludedFromCleaning ? 'Excluded' : 'Eligible',
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(studentRows), 'Students');

  const teamRows = state.teams.map((t) => ({
    Team: t.name,
    ChineseName: t.chineseName,
    Motto: t.motto,
    TotalScore: getTeamTotalScore(t, state.students),
    BonusPoints: t.bonusPoints,
    ...t.categoryScores,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teamRows), 'Teams');

  const pointsRows = state.pointTransactions.map((tx) => {
    const st = state.students.find((s) => s.id === tx.studentId);
    const tm = state.teams.find((t) => t.id === tx.teamId);
    return {
      Date: tx.createdAt.slice(0, 10),
      Student: st?.displayName || '-',
      Team: tm?.name || '-',
      Category: tx.category,
      Points: tx.points,
      Reason: tx.reason,
      ApprovedBy: tx.awardedByName,
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pointsRows), 'PointsHistory');

  const cleaningRows = state.cleaningSchedules.flatMap((w) =>
    w.assignments.map((a) => ({
      Week: w.weekStart,
      Task: a.taskKey,
      Students: a.studentIds
        .map((id) => state.students.find((s) => s.id === id)?.displayName || id)
        .join(', '),
      Status: a.completed ? 'Completed' : 'Pending',
    }))
  );
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(cleaningRows), 'CleaningSchedule');

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `SMART-CLASS-LUT-Report-${today}.xlsx`);
}

export function exportClassroomPdfSummary(state: ClassroomState) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('SMART CLASS - Lanzhou University of Technology', 14, 18);
  doc.setFontSize(10);
  doc.text(`${state.settings.classroomName} | ${state.settings.semesterLabel}`, 14, 25);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 31);

  const teamRows = state.teams.map((t) => [
    t.name,
    String(state.students.filter((s) => s.teamId === t.id && s.active).length),
    String(getTeamTotalScore(t, state.students)),
    String(t.bonusPoints),
  ]);

  autoTable(doc, {
    startY: 38,
    head: [['Team', 'Members', 'Total Score', 'Bonus Points']],
    body: teamRows,
    headStyles: { fillColor: [15, 35, 66] },
  });

  const studentRows = state.students.map((s) => {
    const att = getStudentAttendanceStats(s.id, state.attendanceHistory);
    const team = state.teams.find((t) => t.id === s.teamId);
    return [
      String(s.orderIndex),
      s.englishName || s.studentNumber,
      team?.name || '-',
      String(s.points),
      `${att.rate}%`,
    ];
  });

  autoTable(doc, {
    startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10,
    head: [['#', 'Identifier / English Name', 'Team', 'Points', 'Attendance']],
    body: studentRows,
    headStyles: { fillColor: [15, 35, 66] },
  });

  const today = new Date().toISOString().slice(0, 10);
  doc.save(`SMART-CLASS-LUT-Summary-${today}.pdf`);
}
