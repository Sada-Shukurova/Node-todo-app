import express from "express";
import port from "../utils/port.js";
import _todos from "./db/todos.js";
import _owners from "./db/owner.js";
const app = express();
app.use(express.json());

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

app.get("/owners", (req, res) => {
  const limit = req.query.limit ?? 5;
  const ownerId = req.query.id;

  let filteredOwners = owners;

  if (ownerId) {
    filteredOwners = filteredOwners.filter((owner) => owner.id === ownerId);
  }

  if (limit) {
    filteredOwners = filteredOwners.slice(0, limit);
  }

  if (filteredOwners.length > 0) {
    res.status(200).json(filteredOwners);
  } else {
    res.status(404).json({ message: `No owner found with given parameters` });
  }
});
//
app.get("/owner/:ownerId", (req, res) => {
  const ownerId = req.params.ownerId;
  const owner = owners.find((ow) => ow.id === ownerId);

  if (owner) {
    const todoByOwner = todos.filter(
      (todoByOwner) => todoByOwner.ownerId === owner.id
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

// ------------ POST -----------------
app.post("/todos", (req, res) => {
  let newTodo = {};
  const { statusTodo } = req.body;
  if (statusTodo) {
    newTodo = req.body;
  } else {
    newTodo = { ...req.body, statusTodo: "todo" };
  }

  todos.push(newTodo);
  res.status(201).json({ message: `new todo is created: ${req.body.title}` });
});

// ------------ PUT -----------
app.put("/todos/:id", (req, res) => {
  const { id } = req.params;
  let todoUpdated = false;

  todos = todos.map((todo) => {
    if (todo.id === id) {
      todoUpdated = true;
      return req.body;
    } else {
      return todo;
    }
  });

  if (todoUpdated) {
    res.status(200).send({ message: "todo is updated", id });
  } else {
    res.status(404).send({ message: "there is no todo with that id", id });
  }
});

app.put("/changeStatus/:id/status", (req, res) => {
  const { id } = req.params;
  let updated = false;

  todos = todos.map((todo) => {
    if (todo.id === id) {
      updated = true;

      return { ...todo, statusTodo: req.body.statusTodo };
    } else {
      return todo;
    }
  });

  if (updated) {
    res.status(200).send({
      message: `todo status is updated: ${req.body.statusTodo}`,
      id,
    });
  } else {
    res.status(404).send({ message: "there is no todo with that id", id });
  }
});

app.put("/changeOwner/:id/newOwnerId", (req, res) => {
  const { id } = req.params;
  let updated = false;

  owners = owners.map((owner) => {
    if (owner.id === id) {
      updated = true;

      return { ...owner, id: req.body.id };
    } else {
      return owner;
    }
  });
  todos = todos.map((todo) => {
    if (todo.ownerId === id) {
      updated = true;
      return { ...todo, ownerId: req.body.id };
    } else {
      return todo;
    }
  });

  if (updated) {
    res.status(200).send({
      message: `owner is updated: ${req.body.id}`,
      id,
    });
  } else {
    res.status(404).send({ message: "there is no owner with that id", id });
  }
});

// ----------- LISTEN ------------
app.listen(port, () => {
  console.log(`server is up on ${port}`);
});
