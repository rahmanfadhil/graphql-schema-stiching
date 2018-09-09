const { GraphQLServer } = require("graphql-yoga");
const { makeExecutableSchema, mergeSchemas } = require("graphql-tools");

const users = [
  { id: 1, name: "Rahman Fadhil", books: [1] },
  { id: 2, name: "Abdurrahman", books: [2, 3] }
];

const books = [
  { id: 1, name: "My Great Book", author: 1 },
  { id: 2, name: "Hello World", author: 2 },
  { id: 3, name: "Hello Man!!", author: 2 }
];

const userSchema = makeExecutableSchema({
  typeDefs: `
    type Query {
      allUsers: [User]
      getUserById(id: Int!): User!
    }

    type Mutation {
      createUser(name: String!): User!
    }

    type User {
      id: Int!
      name: String!
    }
  `,
  resolvers: {
    Query: {
      allUsers: () => users,
      getUserById: (_, { id }) => users.find(item => item.id === id)
    },
    Mutation: {
      createUser: (_, { name }) => {
        const data = users.push({ id: users.length + 1, name, books: [] });
        return users[data - 1];
      }
    }
  }
});

const bookSchema = makeExecutableSchema({
  typeDefs: `
    type Query {
      allBooks: [Book]
      getBookById(id: Int!): Book!
    }
    
    type Mutation {
      createBook(user_id: Int!, name: String!): Book!
    }

    type Book {
      id: Int!
      name: String!
    }
  `,
  resolvers: {
    Query: {
      allBooks: () => books,
      getBookById: (_, { id }) => books.find(item => item.id === id)
    },
    Mutation: {
      createBook: (_, { user_id, name }) => {
        const data = books.push({
          id: books.length + 1,
          name,
          author: user_id
        });
        users[user_id].books.push(data);
        console.log(users);
        console.log(books);
        return books[data - 1];
      }
    }
  }
});

const linkDefs = `
  extend type User {
    books: [Book]
  }

  extend type Book {
    author: User
  }
`;

const server = new GraphQLServer({
  schema: mergeSchemas({
    schemas: [userSchema, bookSchema, linkDefs],
    resolvers: {
      User: {
        books: {
          fragment: "... on User { id }",
          resolve: user => books.filter(item => item.author === user.id)
        }
      },
      Book: {
        author: {
          fragment: "... on Book { id }",
          resolve: book => users.find(item => item.books.includes(book.id))
        }
      }
    }
  })
});

server.start(() => console.log("[server] listening ..."));
