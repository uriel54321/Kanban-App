import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Task {
  id: number;
  content: string;
}

interface Column {
  id: number;
  title: string;
  tasks: Task[];
}

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([]);

  useEffect(() => {
    const fetchColumns = async () => {
      const { data, error } = await supabase
        .from('columns')
        .select('*, tasks (*)');
      if (error) {
        console.error('Error fetching columns:', error);
        return;
      }
      setColumns(data as Column[]);
    };

    fetchColumns();
  }, []);

  const addTask = async (columnId: number) => {
    const taskContent = prompt('Enter task content');
    if (taskContent) {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ content: taskContent, column_id: columnId }])
        .select('*');

      if (error) {
        console.error('Error adding task:', error);
        return;
      }

      if (data && data.length > 0) {
        setColumns(columns.map(column =>
          column.id === columnId
            ? { ...column, tasks: [...column.tasks, data[0] as Task] }
            : column
        ));
      } else {
        console.error('No data returned from insert operation.');
      }
    }
  };

  const moveTask = async (taskId: number, fromColumnId: number, toColumnId: number) => {
    const { error } = await supabase
      .from('tasks')
      .update({ column_id: toColumnId })
      .eq('id', taskId);

    if (error) {
      console.error('Error moving task:', error);
      return;
    }
    
    setColumns(columns.map(column => {
      if (column.id === fromColumnId) {
        return { ...column, tasks: column.tasks.filter(task => task.id !== taskId) };
      }
      if (column.id === toColumnId) {
        const task = columns.find(col => col.id === fromColumnId)?.tasks.find(task => task.id === taskId);
        return { ...column, tasks: task ? [...column.tasks, task] : column.tasks };
      }
      return column;
    }));
  };

  const deleteTask = async (taskId: number, columnId: number) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      return;
    }

    setColumns(columns.map(column =>
      column.id === columnId
        ? { ...column, tasks: column.tasks.filter(task => task.id !== taskId) }
        : column
    ));
  };

  const moveTaskBackward = (taskId: number, fromColumnId: number) => {
    const currentColumnIndex = columns.findIndex(column => column.id === fromColumnId);
    if (currentColumnIndex > 0) {
      const toColumnId = columns[currentColumnIndex - 1].id;
      moveTask(taskId, fromColumnId, toColumnId);
    }
  };

  const moveTaskForward = (taskId: number, fromColumnId: number) => {
    const currentColumnIndex = columns.findIndex(column => column.id === fromColumnId);
    if (currentColumnIndex < columns.length - 1) {
      const toColumnId = columns[currentColumnIndex + 1].id;
      moveTask(taskId, fromColumnId, toColumnId);
    }
  };

  const addColumn = async () => {
    const columnTitle = prompt('Enter column title');
    if (columnTitle) {
      const { data, error } = await supabase
        .from('columns')
        .insert([{ title: columnTitle }])
        .select('*');

      if (error) {
        console.error('Error adding column:', error);
        return;
      }

      if (data && data.length > 0) {
        setColumns([...columns, { ...data[0], tasks: [] }]);
      } else {
        console.error('No data returned from insert operation.');
      }
    }
  };

  const deleteColumn = async (columnId: number) => {
    const columnToDelete = columns.find(col => col.id === columnId);
    if (columnToDelete && columnToDelete.tasks.length > 0) {
      toast.error('Cannot delete a column that contains tasks.');
      return;
    }

    const { error } = await supabase
      .from('columns')
      .delete()
      .eq('id', columnId);

    if (error) {
      console.error('Error deleting column:', error);
      return;
    }

    setColumns(columns.filter(column => column.id !== columnId));
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-100 min-h-screen">
      <button
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        onClick={addColumn}
      >
        Add Column
      </button>
      <div className="flex space-x-4 overflow-x-auto w-full">
        {columns.map(column => (
          <div key={column.id} className="bg-white p-4 rounded-lg shadow-lg w-80 max-w-xs flex flex-col border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{column.title}</h2>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => deleteColumn(column.id)}
              >
                Delete
              </button>
            </div>
            <ul className="space-y-4 flex-1">
              {column.tasks.map(task => (
                <li key={task.id} className="border p-2 bg-gray-50 rounded-lg flex justify-between items-center">
                  {task.content}
                  <div className="flex space-x-2">
                    <button
                      className="text-red-500 hover:text-red-700 text-2xl"
                      onClick={() => moveTaskBackward(task.id, column.id)}
                    >
                      ←
                    </button>
                    <button
                      className="text-blue-500 hover:text-blue-700 text-2xl"
                      onClick={() => moveTaskForward(task.id, column.id)}
                    >
                      →
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteTask(task.id, column.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              className="mt-1 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              onClick={() => addTask(column.id)}
            >
              Add Task
            </button>
          </div>
        ))}
      </div>
      <ToastContainer />
    </div>
  );
};

export default KanbanBoard;
