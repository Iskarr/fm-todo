"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Todo } from "../Types";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Complete online JavaScript course", completed: true },
    { id: 2, text: "Jog around the park 3x", completed: false },
    { id: 3, text: "10 minutes meditation", completed: false },
    { id: 4, text: "Read for 1 hour", completed: false },
    { id: 5, text: "Pick up groceries", completed: false },
    { id: 6, text: "Complete Todo App on Frontend Mentor", completed: false },
  ]);

  const [newTodo, setNewTodo] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sortable Todo Item component
  function SortableTodoItem({
    todo,
    toggleTodo,
  }: {
    todo: Todo;
    toggleTodo: (id: number) => void;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: todo.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    // Fix: Handle the toggle separately from drag
    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent drag from being triggered
      toggleTodo(todo.id);
    };

    return (
      <li
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`${
          isDarkMode
            ? "border-(--dark-very-dark-grayish-blue-2)" // dark mode
            : "border-(--light-light-grayish-blue)" // light mode
        } border-b`}
        key={todo.id}
      >
        <div className="flex items-center p-4">
          <button
            onClick={handleToggle}
            className={`w-6 h-6 rounded-full border border-gray-300 mr-3 flex items-center justify-center cursor-pointer border-gradient border-gradient-purple toggle-button ${
              todo.completed
                ? "bg-gradient-to-r from-(--gradient-primary) to-(--gradient-secondary)"
                : ""
            }`}
          >
            {todo.completed && (
              <Image
                src="/images/icon-check.svg"
                width={12}
                height={9}
                alt="Check Icon"
              />
            )}
          </button>
          <span
            className={`flex-grow cursor-grab ${
              isDarkMode
                ? todo.completed
                  ? "line-through text-(--dark-very-dark-grayish-blue-1)" // Dark mode, completed: white text with strike
                  : "text-(--dark-light-grayish-blue)" // Dark mode, not completed: white text
                : todo.completed
                ? "line-through text-(--light-light-grayish-blue)" // Light mode, completed: light gray text with strike
                : "text-(--light-very-dark-grayish-blue)" // Light mode, not completed: dark text
            } ${isDarkMode ? "border-gray-700" : "border-gray-300"}`}
            {...listeners}
          >
            {todo.text}
          </span>
          <button
            onClick={() => setTodos(todos.filter((t) => t.id !== todo.id))}
          >
            <Image
              src="/images/icon-cross.svg"
              width={18}
              height={18}
              alt="Cross Icon"
            />
          </button>
        </div>
      </li>
    );
  }

  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle creating a new todo
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
      setNewTodo("");
    }
  };

  // Toggle todo completion status
  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Clear all completed todos
  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Filter todos based on current filter
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const activeTodosCount = todos.filter((todo) => !todo.completed).length;

  // Toggle dark/light mode
  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Apply dark mode to body
  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-dark-desaturated" : "bg-light-very-light-gray"
      }`}
    >
      <Head>
        <title>Todo App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background image */}
      <div className="relative w-full h-72 bg-gradient-to-r from-(--gradient-secondary) to-(--gradient-primary) z-0">
        {/* You will import your background image here */}
        {isDarkMode && (
          <Image
            src="/images/bg-desktop-dark.jpg"
            alt="Background Image"
            width={1440}
            height={300}
            quality={100}
            className="w-full h-full"
          />
        )}
        {!isDarkMode && (
          <Image
            src="/images/bg-desktop-light.jpg"
            alt="Background Image"
            width={1440}
            height={300}
            quality={100}
            className="w-full h-full"
          />
        )}
      </div>

      {/* Main content */}
      <div className="container max-w-md mx-auto px-2 -mt-48 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-(--light-very-light-gray) text-3xl font-bold tracking-widest">
            T&nbsp;O&nbsp;D&nbsp;O&nbsp;
          </h1>
          <button onClick={toggleMode}>
            {isDarkMode ? (
              <Image
                src="/images/icon-sun.svg"
                width={20}
                height={20}
                alt="Sun Icon"
              />
            ) : (
              <Image
                src="/images/icon-moon.svg"
                width={20}
                height={20}
                alt="Moon Icon"
              />
            )}
          </button>
        </div>

        {/* New Todo Input */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div
            className={`flex items-center rounded-md shadow-md p-4 custom-caret ${
              isDarkMode
                ? "bg-dark-desaturated text-(--dark-light-grayish-blue)"
                : "bg-light-very-light-gray"
            }`}
          >
            <div className="w-6 h-6 rounded-full border border-gray-300 mr-3"></div>
            <input
              type="text"
              placeholder="Create a new todo..."
              className={`w-full outline-none ${
                isDarkMode
                  ? "bg-dark-desaturated text-(--dark-light-grayish-blue)"
                  : "text-(--light-very-dark-grayish-blue)"
              }`}
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
            />
          </div>
        </form>

        {/* Todo List */}
        <div
          className={`rounded-md shadow-md overflow-hidden ${
            isDarkMode
              ? "bg-dark-desaturated text-(--dark-light-grayish-blue)"
              : "text-(--light-very-dark-grayish-blue) bg-light-very-light-gray"
          }`}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTodos.map((todo) => todo.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul>
                {filteredTodos.map((todo) => (
                  <SortableTodoItem
                    key={todo.id}
                    todo={todo}
                    toggleTodo={toggleTodo}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>

          {/* Todo Footer */}
          <div
            className={`${
              isDarkMode
                ? "text-(--dark-dark-grayish-blue)" // dark mode
                : "text-(--light-dark-grayish-blue)" // light mode
            } flex justify-between items-center p-4 text-sm font-normal`}
          >
            <span className="font-semibold">{activeTodosCount} items left</span>

            <div
              className={`${
                isDarkMode
                  ? "text-(--light-dark-grayish-blue)" // dark mode
                  : "text-(--light-dark-grayish-blue)" // light mode
              } hidden md:flex space-x-4`}
            >
              <button
                onClick={() => setFilter("all")}
                className={`${
                  filter === "all"
                    ? "font-bold text-(--primary-bright-blue)"
                    : "font-bold"
                } cursor-pointer ${
                  filter === "all"
                    ? ""
                    : isDarkMode
                    ? "highlight-dark"
                    : "highlight-light"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`${
                  filter === "active"
                    ? "font-bold text-(--primary-bright-blue)"
                    : "font-bold"
                } cursor-pointer ${
                  filter === "active"
                    ? ""
                    : isDarkMode
                    ? "highlight-dark"
                    : "highlight-light"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`${
                  filter === "completed"
                    ? "font-bold text-(--primary-bright-blue)"
                    : "font-bold"
                } cursor-pointer ${
                  filter === "completed"
                    ? ""
                    : isDarkMode
                    ? "highlight-dark"
                    : "highlight-light"
                }`}
              >
                Completed
              </button>
            </div>

            <button
              onClick={clearCompleted}
              className={`font-semibold cursor-pointer ${
                isDarkMode ? "highlight-dark" : "highlight-light"
              }`}
            >
              Clear Completed
            </button>
          </div>
        </div>

        {/* Mobile Filter Buttons */}
        <div
          className={`md:hidden mt-4 p-4  rounded-md shadow-md flex justify-center space-x-4 ${
            isDarkMode ? "bg-gray-800 text-white" : "bg-light-very-light-gray"
          }`}
        >
          <button
            onClick={() => setFilter("all")}
            className={`${
              filter === "all" ? "text-(--primary-bright-blue) font-bold" : ""
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`${
              filter === "active"
                ? "text-(--primary-bright-blue) font-bold"
                : ""
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={` ${
              isDarkMode
                ? "bg-gray-800 text-gray-200"
                : "bg-light-very-light-gray text-(--primary-bright-blue)"
            }${filter === "completed" ? "font-bold" : ""}`}
          >
            Completed
          </button>
        </div>

        {/* Drag and Drop Hint */}
        <p className="text-center text-(--light-dark-grayish-blue) text-sm mt-12">
          Drag and drop to reorder list
        </p>
      </div>
    </div>
  );
}
