import type { SubmitAnswerBody } from '../../types/assessment.js';
import * as repo from '../repositories/assessment.repository.js';

const FIRST_QUESTION_KEY = 'FASE1';

const getQuestionByKey = async (key: string) => {
  const question = await repo.findQuestionByKey(key);

  if (!question) throw { status: 404, message: `Pertanyaan '${key}' tidak ditemukan` };
  return question;
};

export const startSessionService = async (userId: string) => {
  const existing = await repo.findInProgressSession(userId);

  if (existing) {
    const lastAnswer = existing.answers[0];

    if (!lastAnswer) {
      const firstQuestion = await getQuestionByKey(FIRST_QUESTION_KEY);
      return { sessionId: existing.id, isResumed: true, question: firstQuestion };
    }

    const lastOption = await repo.findOptionByQuestionAndValue(lastAnswer.questionId, lastAnswer.answerValue);

    if (!lastOption?.nextQuestionKey) {
      return { sessionId: existing.id, isResumed: true, isCompleted: true };
    }

    const nextQuestion = await getQuestionByKey(lastOption.nextQuestionKey);
    return { sessionId: existing.id, isResumed: true, question: nextQuestion };
  }

  const session      = await repo.createSession(userId);
  const firstQuestion = await getQuestionByKey(FIRST_QUESTION_KEY);

  return { sessionId: session.id, isResumed: false, question: firstQuestion };
};

export const submitAnswerService = async (
  userId:    string,
  sessionId: string,
  body:      SubmitAnswerBody
) => {
  const { questionKey, answerValue } = body;

  const session = await repo.findSessionById(sessionId);
  if (!session)              throw { status: 404, message: 'Sesi tidak ditemukan' };
  if (session.userId !== userId) throw { status: 403, message: 'Akses ditolak' };
  if (session.status === 'COMPLETED') throw { status: 400, message: 'Sesi sudah selesai' };

  const question = await repo.findQuestionByKeyWithAllOptions(questionKey);
  if (!question) throw { status: 404, message: `Pertanyaan '${questionKey}' tidak ditemukan` };

  const normalizedValue = Array.isArray(answerValue)
    ? JSON.stringify(answerValue)
    : String(answerValue);


  await repo.upsertAnswer(sessionId, question.id, questionKey, normalizedValue);

  let nextQuestionKey: string | null = null;

  if (question.inputType === 'single_choice') {
    const chosenOption = question.options.find(o => o.value === String(answerValue));
    nextQuestionKey = chosenOption?.nextQuestionKey ?? null;
  } else {
    nextQuestionKey = question.options[0]?.nextQuestionKey ?? null;
  }

  if (!nextQuestionKey) {
    await completeSessionService(userId, sessionId);
    return { isCompleted: true, nextQuestion: null };
  }

  const nextQuestion = await getQuestionByKey(nextQuestionKey);
  return { isCompleted: false, nextQuestion };
};

export const completeSessionService = async (userId: string, sessionId: string) => {
  const session = await repo.findSessionWithAnswersAndQuestions(sessionId);

  if (!session)                  throw { status: 404, message: 'Sesi tidak ditemukan' };
  if (session.userId !== userId) throw { status: 403, message: 'Akses ditolak' };

  const answerMap: Record<string, string> = {};
  session.answers.forEach(a => { answerMap[a.questionKey] = a.answerValue; });

  const safeParseArray = (val: string | undefined): string[] => {
    if (!val) return [];
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      return [val];
    }
  };

  const itInterests: string[] = [
    ...safeParseArray(answerMap['FASE2A_2']),
    ...safeParseArray(answerMap['FASE2B_1'])
  ];
  
  // Gaya Belajar & Lingkungan Kerja
  const learningStyle = answerMap['FASE3_2'] ?? null;
  const workEnvPreference = answerMap['FASE3_3'] ?? null;

  const weeklyHoursRaw = answerMap['FASE3_5'] ?? null;
  const weeklyHoursMap: Record<string, number> = {
    '<5':   3,
    '5-10':  7,
    '10-20': 15,
    '>20':  25,
  };
  const weeklyHours = weeklyHoursRaw ? (weeklyHoursMap[weeklyHoursRaw] ?? null) : null;

  // IT Background based on FASE1 routing (C/D are tech paths)
  const fase1Answer = answerMap['FASE1'] ?? null;
  const itBackground = fase1Answer ? ['C', 'D'].includes(fase1Answer) : null;

  await repo.upsertUserProfileData(userId, {
    itInterests,
    learningStyle,
    workEnvPreference,
    weeklyHours,
    itBackground
  });
  await repo.updateSessionStatus(sessionId, 'COMPLETED');

  return { message: 'Asesmen selesai. Profil kamu telah diperbarui.' };
};

export const getSessionSummaryService = async (userId: string, sessionId: string) => {
  const session = await repo.findSessionWithAnswersAndQuestionSummary(sessionId);

  if (!session)                  throw { status: 404, message: 'Sesi tidak ditemukan' };
  if (session.userId !== userId) throw { status: 403, message: 'Akses ditolak' };

  return {
    sessionId: session.id,
    status:    session.status,
    answers:   session.answers.map(a => ({
      questionKey:  a.questionKey,
      questionText: a.question.text,
      inputType:    a.question.inputType,
      answerValue:  a.answerValue,
    })),
  };
};