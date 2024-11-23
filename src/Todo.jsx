import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";

// API functions
const fetchTasks = async () => {
  const { data } = await axios.get("https://jsonplaceholder.typicode.com/todos?_limit=15");
  return data;
};

const addTask = async (newTask) => {
  const { data } = await axios.post("https://jsonplaceholder.typicode.com/todos", newTask);
  return data;
};

const updateTask = async (updatedTask) => {
  const { data } = await axios.put(
    `https://jsonplaceholder.typicode.com/todos/${updatedTask.id}`,
    updatedTask
  );
  return data;
};

const deleteTask = async (taskId) => {
  await axios.delete(`https://jsonplaceholder.typicode.com/todos/${taskId}`);
};

const TodoApp = () => {
  const queryClient = useQueryClient();
  const [newTask, setNewTask] = useState("");

  const { data: tasks, isLoading } = useQuery("tasks", fetchTasks);

  const addTaskMutation = useMutation(addTask, {
    onMutate: async (newTask) => {
      await queryClient.cancelQueries("tasks");
      const previousTasks = queryClient.getQueryData("tasks");
      queryClient.setQueryData("tasks", (old) => [...old, { ...newTask, id: Date.now() }]);
      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      queryClient.setQueryData("tasks", context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries("tasks");
    },
  });

  const updateTaskMutation = useMutation(updateTask, {
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries("tasks");
      const previousTasks = queryClient.getQueryData("tasks");
      queryClient.setQueryData("tasks", (old) =>
        old.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      return { previousTasks };
    },
    onError: (err, updatedTask, context) => {
      queryClient.setQueryData("tasks", context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries("tasks");
    },
  });

  const deleteTaskMutation = useMutation(deleteTask, {
    onMutate: async (taskId) => {
      await queryClient.cancelQueries("tasks");
      const previousTasks = queryClient.getQueryData("tasks");
      queryClient.setQueryData("tasks", (old) => old.filter((task) => task.id !== taskId));
      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      queryClient.setQueryData("tasks", context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries("tasks");
    },
  });

  const handleAddTask = () => {
    if (newTask.trim()) {
      addTaskMutation.mutate({ title: newTask, completed: false });
      setNewTask("");
    }
  };

  const handleToggleTask = (task) => {
    updateTaskMutation.mutate({ ...task, completed: !task.completed });
  };

  const handleDeleteTask = (taskId) => {
    deleteTaskMutation.mutate(taskId);
  };

  if (isLoading) return <div>Loading tasks...</div>;

  return (
    <div className="min-h-screen ">
        
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-4xl font-bold text-center text-black mb-6 ">Todo Manager</h1>

        {/* Add Task Section */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <button
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            onClick={handleAddTask}
          >
            Add Task
          </button>
        </div>

        {/* Task List Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead className="bg-blue-200 text-blue-900">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Task</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr
                  key={task.id}
                  className={`${
                    task.completed ? "bg-green-50" : "bg-red-50"
                  } hover:bg-gray-100 transition`}
                >
                  <td className="border border-gray-300 px-4 py-2">
                    <span
                      className={`cursor-pointer ${
                        task.completed ? "line-through text-gray-500" : "text-gray-700"
                      }`}
                      onClick={() => handleToggleTask(task)}
                    >
                      {index + 1}. {task.title}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {task.completed ? (
                      <span className="px-3 py-1 rounded bg-green-200 text-green-800 font-semibold">
                        Completed
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded bg-red-200 text-red-800 font-semibold">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      className="px-3 py-1 text-sm font-semibold text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition"
                      onClick={() => handleToggleTask(task)}
                    >
                      Toggle
                    </button>
                    <button
                      className="ml-2 px-3 py-1 text-sm font-semibold text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TodoApp;
