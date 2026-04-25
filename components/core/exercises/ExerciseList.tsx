'use client';

import type {
  ExerciseCatalogFilters,
  ExerciseCatalogListItem,
  ExerciseCatalogPage,
} from '@/lib/core/types';
import { useEffect, useRef, useState } from 'react';

type ExerciseListProps = {
  filters: ExerciseCatalogFilters;
  initialPage: ExerciseCatalogPage;
};

function buildExercisesApiUrl(
  filters: ExerciseCatalogFilters,
  limit: number,
  offset: number
) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  if (filters.q) {
    params.set('q', filters.q);
  }

  if (filters.equipment) {
    params.set('equipment', filters.equipment);
  }

  if (filters.muscleGroup) {
    params.set('muscleGroup', filters.muscleGroup);
  }

  return `/api/exercises?${params.toString()}`;
}

function ExerciseRow({ exercise }: { exercise: ExerciseCatalogListItem }) {
  return (
    <div className="flex items-center justify-between gap-4 py-[2px]">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] leading-6 font-semibold tracking-[-0.02em] text-[#475467]">
          {exercise.name}
        </p>
        <p className="mt-0.5 text-[14px] leading-5 font-medium text-[#98A2B3]">
          {exercise.equipment}
        </p>
      </div>

      <div className="bg-my-secondary shrink-0 rounded-[10px] px-[14px] py-[6px] text-[16px] leading-6 font-medium text-[#B42318]">
        {exercise.muscleGroup}
      </div>
    </div>
  );
}

export function ExerciseList({ filters, initialPage }: ExerciseListProps) {
  const { equipment, muscleGroup, q } = filters;
  const scrollRootRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const [exercises, setExercises] = useState(initialPage.exercises);
  const [nextOffset, setNextOffset] = useState(initialPage.nextOffset);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scrollRoot = scrollRootRef.current;
    const sentinel = sentinelRef.current;

    if (!scrollRoot || !sentinel || nextOffset === null) {
      return;
    }

    let active = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || loadingRef.current) {
          return;
        }

        loadingRef.current = true;
        setLoading(true);
        setError(null);

        fetch(
          buildExercisesApiUrl(
            { equipment, muscleGroup, q },
            initialPage.limit,
            nextOffset
          )
        )
          .then(async (response) => {
            if (!response.ok) {
              throw new Error('Failed to load more exercises.');
            }

            return (await response.json()) as ExerciseCatalogPage;
          })
          .then((page) => {
            if (!active) {
              return;
            }

            setExercises((currentExercises) => [
              ...currentExercises,
              ...page.exercises,
            ]);
            setNextOffset(page.nextOffset);
          })
          .catch(() => {
            if (active) {
              setError('Could not load more exercises.');
            }
          })
          .finally(() => {
            if (active) {
              loadingRef.current = false;
              setLoading(false);
            }
          });
      },
      { root: scrollRoot, rootMargin: '160px 0px' }
    );

    observer.observe(sentinel);

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [equipment, initialPage.limit, muscleGroup, nextOffset, q]);

  return (
    <div
      ref={scrollRootRef}
      className="min-h-0 flex-1 overflow-y-auto px-5 pt-[18px] pb-5"
    >
      {exercises.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <p className="text-xl font-medium text-gray-950">
            No Exercises Found
          </p>
          <p className="text-body">
            Exercises will appear here once available.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-[10px]">
          {exercises.map((exercise) => (
            <ExerciseRow key={exercise.id} exercise={exercise} />
          ))}

          {nextOffset !== null && (
            <div
              ref={sentinelRef}
              className="py-4 text-center text-[14px] font-medium text-[#98A2B3]"
            >
              {loading ? 'Loading more exercises...' : 'Scroll for more'}
            </div>
          )}

          {error && (
            <p className="py-3 text-center text-[14px] font-medium text-[#B42318]">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
