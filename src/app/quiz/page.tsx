"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QUIZ_QUESTIONS, tallyQuizAccords } from "@/lib/quiz";
import { findByAccordPairs } from "@/lib/similarity";
import { loadCatalog, loadLookup } from "@/lib/data";
import { useApp } from "@/lib/context";
import { AccordPill } from "@/components/AccordPill";
import { PerfumeCard } from "@/components/PerfumeCard";
import type { Perfume } from "@/lib/types";

export default function QuizPage() {
  const router = useRouter();
  const { dispatch } = useApp();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [topAccords, setTopAccords] = useState<string[]>([]);
  const [resultPerfumes, setResultPerfumes] = useState<Perfume[]>([]);
  const [catalog, setCatalog] = useState<Perfume[]>([]);
  const [lookup, setLookup] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadCatalog(), loadLookup()]).then(([c, l]) => {
      setCatalog(c);
      setLookup(l);
      setLoading(false);
    });
  }, []);

  function selectOption(optionIdx: number) {
    const newAnswers = [...answers, optionIdx];
    setAnswers(newAnswers);

    if (currentQ + 1 < QUIZ_QUESTIONS.length) {
      setCurrentQ(currentQ + 1);
    } else {
      // Quiz complete — tally and show results
      const accords = tallyQuizAccords(newAnswers);
      const top = accords.slice(0, 5);
      setTopAccords(top);
      dispatch({ type: "SET_QUIZ_ACCORDS", accords: top });

      const ids = findByAccordPairs(top, catalog, lookup, 6);
      setResultPerfumes(ids.map((id) => catalog[id]));
      setShowResults(true);
    }
  }

  function addToPicks(perfumeId: number) {
    dispatch({ type: "ADD_PICK", perfumeId });
  }

  function goToRecs() {
    router.push("/recommendations");
  }

  function restart() {
    setCurrentQ(0);
    setAnswers([]);
    setShowResults(false);
    setTopAccords([]);
    setResultPerfumes([]);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-stone-500">
        Loading catalog...
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl font-medium text-stone-900 mb-2">Your Scent Profile</h1>
        <p className="text-stone-500 mb-6">Based on your answers, you gravitate towards these accords:</p>

        <div className="flex flex-wrap gap-2 mb-8">
          {topAccords.map((accord) => (
            <AccordPill key={accord} accord={accord} large />
          ))}
        </div>

        <h2 className="font-serif text-xl font-medium text-stone-900 mb-4">
          Perfumes we think you&apos;ll love
        </h2>
        <div className="grid gap-3 mb-8">
          {resultPerfumes.map((p) => (
            <PerfumeCard
              key={p.id}
              perfume={p}
              action={
                <button
                  onClick={() => addToPicks(p.id)}
                  className="text-xs px-3 py-1.5 rounded-md bg-stone-900 text-white hover:bg-stone-700 transition-colors"
                >
                  + Pick
                </button>
              }
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={goToRecs}
            className="px-5 py-2.5 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            Get Recommendations
          </button>
          <button
            onClick={restart}
            className="px-5 py-2.5 rounded-lg border border-stone-300 text-stone-600 text-sm hover:bg-stone-100 transition-colors"
          >
            Retake Quiz
          </button>
          <a
            href="/build"
            className="px-5 py-2.5 rounded-lg border border-stone-300 text-stone-600 text-sm hover:bg-stone-100 transition-colors"
          >
            Fine-tune in Scent Builder
          </a>
        </div>
      </div>
    );
  }

  const q = QUIZ_QUESTIONS[currentQ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-stone-400 font-medium">
            {currentQ + 1} / {QUIZ_QUESTIONS.length}
          </span>
          <div className="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-stone-900 rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-medium text-stone-900">
          {q.question}
        </h1>
      </div>

      <div className="grid gap-3">
        {q.options.map((option, i) => (
          <button
            key={i}
            onClick={() => selectOption(i)}
            className="text-left bg-white border border-stone-200 rounded-lg p-5 hover:border-stone-400 hover:shadow-sm transition-all"
          >
            <div className="font-medium text-stone-900">{option.label}</div>
            <div className="text-sm text-stone-500 mt-0.5">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
