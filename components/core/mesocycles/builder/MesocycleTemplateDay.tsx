'use client';

import DayComboBox from '@/components/core/shared/DayComboBox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type {
  ExercisesByMuscleGroup,
  MesocycleDayDraft,
  PlannedExerciseDraft,
  Weekday,
} from '@/lib/core/types';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  EllipsisVertical,
  Trash,
} from 'lucide-react';
import { useRef, useState, type DragEvent, type PointerEvent } from 'react';
import MuscleGroupDialog from './MuscleGroupDialog';
import PlannedExerciseCard from './PlannedExerciseCard';

type MesocycleTemplateDayProps = {
  day: MesocycleDayDraft;
  dayIndex: number;
  dayCount: number;
  exercisesByMuscleGroup: ExercisesByMuscleGroup;
  isDuplicateDisabled: boolean;
  muscleGroups: string[];
  onAddMuscleGroup: (dayIndex: number, muscleGroup: string) => void;
  onDayChange: (dayIndex: number, dayOfWeek: Weekday | null) => void;
  onDuplicateDay: (dayIndex: number) => void;
  onMoveDay: (fromDayIndex: number, toDayIndex: number) => void;
  onMovePlannedExercise: (
    dayIndex: number,
    fromPlannedExerciseIndex: number,
    toPlannedExerciseIndex: number
  ) => void;
  onPlannedExerciseChange: (
    dayIndex: number,
    plannedExerciseIndex: number,
    plannedExercise: PlannedExerciseDraft
  ) => void;
  onRemoveDay: (dayIndex: number) => void;
  onRemovePlannedExercise: (
    dayIndex: number,
    plannedExerciseIndex: number
  ) => void;
};

export default function MesocycleTemplateDay({
  day,
  dayIndex,
  dayCount,
  exercisesByMuscleGroup,
  isDuplicateDisabled,
  muscleGroups,
  onAddMuscleGroup,
  onDayChange,
  onDuplicateDay,
  onMoveDay,
  onMovePlannedExercise,
  onPlannedExerciseChange,
  onRemoveDay,
  onRemovePlannedExercise,
}: MesocycleTemplateDayProps) {
  const [draggedPlannedExerciseIndex, setDraggedPlannedExerciseIndex] =
    useState<number | null>(null);
  const [dragOverPlannedExerciseIndex, setDragOverPlannedExerciseIndex] =
    useState<number | null>(null);
  const touchDraggedPlannedExerciseIndexRef = useRef<number | null>(null);

  const resetPlannedExerciseDragState = () => {
    touchDraggedPlannedExerciseIndexRef.current = null;
    setDraggedPlannedExerciseIndex(null);
    setDragOverPlannedExerciseIndex(null);
  };

  const getPlannedExerciseIndexAtPoint = (
    clientX: number,
    clientY: number
  ) => {
    const plannedExerciseElement = document
      .elementsFromPoint(clientX, clientY)
      .find(
        (element): element is HTMLElement =>
          element instanceof HTMLElement &&
          element.dataset.mesocycleDayIndex === String(dayIndex) &&
          element.dataset.plannedExerciseIndex != null
      );

    if (plannedExerciseElement == null) {
      return null;
    }

    return Number(plannedExerciseElement.dataset.plannedExerciseIndex);
  };

  const isInteractiveDragTarget = (target: EventTarget | null) =>
    target instanceof HTMLElement &&
    target.closest(
      'button, input, textarea, select, [role="combobox"], [data-slot="combobox-trigger"], [data-slot="combobox-content"], [data-slot="dropdown-menu-trigger"]'
    ) != null;

  const handlePlannedExerciseDragStart = (
    event: DragEvent<HTMLDivElement>,
    plannedExerciseIndex: number
  ) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(plannedExerciseIndex));
    setDraggedPlannedExerciseIndex(plannedExerciseIndex);
  };

  const handlePlannedExerciseDragOver = (
    event: DragEvent<HTMLDivElement>,
    plannedExerciseIndex: number
  ) => {
    if (draggedPlannedExerciseIndex == null) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOverPlannedExerciseIndex(plannedExerciseIndex);
  };

  const handlePlannedExerciseDrop = (
    event: DragEvent<HTMLDivElement>,
    plannedExerciseIndex: number
  ) => {
    event.preventDefault();

    if (draggedPlannedExerciseIndex != null) {
      onMovePlannedExercise(
        dayIndex,
        draggedPlannedExerciseIndex,
        plannedExerciseIndex
      );
    }

    setDraggedPlannedExerciseIndex(null);
    setDragOverPlannedExerciseIndex(null);
  };

  const handlePlannedExerciseDragEnd = () => {
    resetPlannedExerciseDragState();
  };

  const handlePlannedExercisePointerDown = (
    event: PointerEvent<HTMLDivElement>,
    plannedExerciseIndex: number
  ) => {
    if (
      event.pointerType === 'mouse' ||
      day.plannedExercises.length < 2 ||
      isInteractiveDragTarget(event.target)
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    touchDraggedPlannedExerciseIndexRef.current = plannedExerciseIndex;
    setDraggedPlannedExerciseIndex(plannedExerciseIndex);
  };

  const handlePlannedExercisePointerMove = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (touchDraggedPlannedExerciseIndexRef.current == null) {
      return;
    }

    event.preventDefault();

    const plannedExerciseIndex = getPlannedExerciseIndexAtPoint(
      event.clientX,
      event.clientY
    );

    setDragOverPlannedExerciseIndex(plannedExerciseIndex);
  };

  const handlePlannedExercisePointerUp = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    const draggedPlannedExerciseIndex =
      touchDraggedPlannedExerciseIndexRef.current;

    if (draggedPlannedExerciseIndex == null) {
      return;
    }

    event.preventDefault();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const plannedExerciseIndex = getPlannedExerciseIndexAtPoint(
      event.clientX,
      event.clientY
    );

    if (plannedExerciseIndex != null) {
      onMovePlannedExercise(
        dayIndex,
        draggedPlannedExerciseIndex,
        plannedExerciseIndex
      );
    }

    resetPlannedExerciseDragState();
  };

  return (
    <div className="min-w-[300px]">
      <div className="flex items-center justify-between bg-white p-2.5">
        <div className="h-[40px] max-w-38">
          <DayComboBox
            value={day.dayOfWeek}
            onValueChange={(dayOfWeek) => onDayChange(dayIndex, dayOfWeek)}
          />
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xl" aria-label="Day options">
                <EllipsisVertical className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
              <DropdownMenuItem
                disabled={dayIndex === 0}
                onClick={() => onMoveDay(dayIndex, dayIndex - 1)}
              >
                <ArrowLeft className="size-4" />
                Move left
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={dayIndex === dayCount - 1}
                onClick={() => onMoveDay(dayIndex, dayIndex + 1)}
              >
                <ArrowRight className="size-4" />
                Move right
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isDuplicateDisabled}
                onClick={() => onDuplicateDay(dayIndex)}
              >
                <Copy className="size-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={dayCount === 1}
                onClick={() => onRemoveDay(dayIndex)}
              >
                <Trash className="size-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* List planned exercises */}
      <div
        className={cn(
          'flex flex-col gap-2.5 bg-gray-100 px-2.5',
          day.plannedExercises.length > 0 && 'pt-2.5'
        )}
      >
        {day.plannedExercises.map((planned, plannedIndex) => (
          <div
            key={`${planned.muscleGroup}-${planned.exerciseOrder}`}
            data-mesocycle-day-index={dayIndex}
            data-planned-exercise-index={plannedIndex}
            draggable
            className={cn(
              'relative cursor-grab touch-none active:cursor-grabbing',
              draggedPlannedExerciseIndex === plannedIndex && 'opacity-50',
              dragOverPlannedExerciseIndex === plannedIndex &&
                draggedPlannedExerciseIndex !== plannedIndex &&
                draggedPlannedExerciseIndex != null &&
                plannedIndex < draggedPlannedExerciseIndex &&
                'before:absolute before:-top-[7px] before:right-0 before:left-0 before:h-0.5 before:rounded-full before:bg-red-500',
              dragOverPlannedExerciseIndex === plannedIndex &&
                draggedPlannedExerciseIndex !== plannedIndex &&
                draggedPlannedExerciseIndex != null &&
                plannedIndex > draggedPlannedExerciseIndex &&
                'after:absolute after:right-0 after:-bottom-[7px] after:left-0 after:h-0.5 after:rounded-full after:bg-red-500'
            )}
            onDragStart={(event) =>
              handlePlannedExerciseDragStart(event, plannedIndex)
            }
            onDragOver={(event) =>
              handlePlannedExerciseDragOver(event, plannedIndex)
            }
            onDrop={(event) => handlePlannedExerciseDrop(event, plannedIndex)}
            onDragEnd={handlePlannedExerciseDragEnd}
            onPointerDown={(event) =>
              handlePlannedExercisePointerDown(event, plannedIndex)
            }
            onPointerMove={handlePlannedExercisePointerMove}
            onPointerUp={handlePlannedExercisePointerUp}
            onPointerCancel={resetPlannedExerciseDragState}
          >
            <PlannedExerciseCard
              exercises={exercisesByMuscleGroup[planned.muscleGroup] ?? []}
              value={planned}
              onValueChanged={(nextPlannedExercise) =>
                onPlannedExerciseChange(
                  dayIndex,
                  plannedIndex,
                  nextPlannedExercise
                )
              }
              onRemove={() => onRemovePlannedExercise(dayIndex, plannedIndex)}
            />
          </div>
        ))}
      </div>
      {/* Add muscle group */}
      <div className="bg-gray-100 p-2.5">
        <div className="border-border flex h-[60px] items-center justify-center rounded-[8px] border-2 border-dashed">
          <MuscleGroupDialog
            muscleGroups={muscleGroups}
            onSelect={(muscleGroup) => onAddMuscleGroup(dayIndex, muscleGroup)}
          />
        </div>
      </div>
    </div>
  );
}
