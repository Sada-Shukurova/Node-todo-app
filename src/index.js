import express from "express";
import port from "../utils/port.js";
import _todos from "./db/todos.js";
import _owners from "./db/owner.js";
const app = express();
app.use(express.json());

let todos = [..._todos];
let owners = [..._owners];

// --------- GET ----------

// GET ALL TODOS BY LIMIT

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

//GET TODO BY ID

app.get("/todos/:id", (req, res) => {
  const id = req.params.id;
  const todo = todos.find((todo) => todo.id === id);
  if (todo) {
    res.status(200).json(todo);
  } else {
    res.status(404).json({ message: `todo with id=${id} is not found` });
  }
});

//GET ALL OWNERS BY LIMIT

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

//GET OWNER TODOS BY OWNER ID

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

//GET OWNER INFO BY TODO ID

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

// POST NEW TODO

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

//UPDATE TODO BY ID

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

//UPDATE TODO STATUS BY ID

app.put("/changeStatus/:id/status", (req, res) => {
  const { id } = req.params;
  let updated = false;

  todos = todos.map((todo) => {
    if (todo.id === id) {
      updated = true;

      return {
        ...todo,
        statusTodo: req.body.statusTodo ? req.body.statusTodo : todo.statusTodo,
      };
    } else {
      return todo;
    }
  });

  if (updated) {
    res.status(200).send({
      message: `${
        req.body.statusTodo
          ? "todo status is updated"
          : "todo status is the same"
      }`,
      id,
    });
  } else {
    res.status(404).send({ message: "there is no todo with that id", id });
  }
});

//UPDATE OWNER ID IN OWNERS AND OWNER ID IN TODOS

app.put("/changeOwner/:id/newOwnerId", (req, res) => {
  const { id } = req.params;
  let updated = false;

  owners = owners.map((owner) => {
    if (owner.id === id) {
      updated = true;

      return { ...owner, id: req.body.id ? req.body.id : owner.id };
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
      message: `${
        req.body.id ? "owner id is updated" : "owner id is the same"
      }`,
      id,
    });
  } else {
    res.status(404).send({ message: "there is no owner with that id", id });
  }
});

// ----------------- DELETE ----------

// DELETE TODO BY ID

app.delete("/todos/:id", (req, res) => {
  const { id } = req.params;
  todos = todos.filter((todo) => todo.id !== id);
  res.status(200).send({ message: `todo with id ${id} is deleted` });
});

// DELETE ALL TODOS BY STATUS

app.delete("/todos/status/:status", (req, res) => {
  const { status } = req.params;
  const todosToDelete = todos.filter((todo) => todo.statusTodo === status);

  if (todosToDelete.length > 0) {
    todos = todos.filter((todo) => todo.statusTodo !== status);
    res.status(200).json({
      message: `all todos with status ${status} are deleted`,
    });
  } else {
    res
      .status(404)
      .json({ message: `todos of status ${status} are not found` });
  }
});

// DELETE ALL TODOS BY OWNER ID

app.delete("/todos/delete/:ownerId", (req, res) => {
  const { ownerId } = req.params;
  const ownerFoundByTodoId = owners.find((owner) => owner.id === ownerId);

  if (ownerFoundByTodoId) {
    const deletedTodos = todos.filter((todo) => todo.ownerId === ownerId);
    todos = todos.filter((todo) => todo.ownerId !== ownerId);

    // Update owners
    ownerFoundByTodoId.todos = "no todos";

    deletedTodos.length > 0
      ? res.status(200).json({
          message: `All todos by owner with id ${ownerId} are deleted`,
          deletedTodos: deletedTodos,
        })
      : res.status(200).json({
          message: `There are no todos`,
        });
  } else {
    res.status(404).json({ message: `There are no owners with id ${ownerId}` });
  }
});

// ----------- LISTEN ------------
app.listen(port, () => {
  console.log(`server is up on ${port}`);
});
