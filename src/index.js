import express from "express";
import port from "../utils/port.js";
import _todos from "./db/todos.js";
import _owners from "./db/owner.js";
const app = express();

let todos = [..._todos];
let owners = [..._owners];

// --------- GET ----------

app.get("/todos", (req, res) => {
  const limit = req.query.limit ?? 3;
  const statusTodo = req.query.statusTodo;

  let filteredTodos = todos;

  if (statusTodo) {
    filteredTodos = filteredTodos.filter(
      (todo) => todo.statusTodo === statusTodo
    );
  }

  if (limit) {
    filteredTodos = filteredTodos.slice(0, limit);
  }

  if (filteredTodos.length > 0) {
    res.status(200).json(filteredTodos);
  } else {
    res.status(404).json({ message: `No todos found with given parameters` });
  }
});

//
app.get("/todos/:id", (req, res) => {
  const id = req.params.id;
  const todo = todos.find((todo) => todo.id === id);
  if (todo) {
    res.status(200).json(todo);
  } else {
    res.status(404).json({ message: `todo with id=${id} is not found` });
  }
});
//
app.get("/owner/:ownerId", (req, res) => {
  const ownerId = req.params.ownerId;
  const owner = owners.find((ow) => ow.id === ownerId);

  if (owner) {
    const todoByOwner = todos.filter(
      (todoByOwner) => todoByOwner.ownerld === owner.id
    );
    if (todoByOwner.length > 0) {
      res.status(200).json(todoByOwner);
    } else {
      res.status(404).json({ message: `there is no todos by ${owner.name}` });
    }
  } else {
    res.status(404).json({ message: `there is no owner with id= ${ownerId}` });
  }
});
//
app.get("/:id/owner", (req, res) => {
  const todoId = req.params.id;
  const todo = todos.find((to) => to.id === todoId);

  if (todo) {
    const ownerByTodoId = owners.filter(
      (ownerByTodo) => ownerByTodo.todos === todo.id
    );
    if (ownerByTodoId.length > 0) {
      res.status(200).json(ownerByTodoId);
    } else {
      res.status(404).json({ message: `there is no owners by ${todo.id}` });
    }
  } else {
    res.status(404).json({ message: `there is no todo with id= ${todoId}` });
  }
});

// ----------- LISTEN ------------
app.listen(port, () => {
  console.log(`server is up on ${port}`);
});
