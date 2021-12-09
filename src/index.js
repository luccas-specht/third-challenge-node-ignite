const express = require('express');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

const repositories = [];

const checkIfRepositoryExists = (request, response, next) => {
  const {
    params: { id },
  } = request;

  const isSomeRepository = repositories.some(
    (repository) => repository.id === id
  );

  if (!isSomeRepository)
    return response.status(404).json({ error: 'Repository not found' });

  return next();
};

const buildRepositoryToUpdate = (data) => {
  const { title = undefined, url = undefined, techs = undefined } = data;

  const reduceData = [title, url, techs].reduce(
    (account, currentValue) => currentValue && { account, currentValue },
    {}
  );

  return reduceData ?? {};
};

app.get('/repositories', (request, response) => {
  return response.json(repositories);
});

app.post('/repositories', (request, response) => {
  const {
    body: { title, url, techs },
  } = request;

  const repository = {
    id: uuidv4(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(repository);

  return response.status(201).json(repository);
});

app.post('/repositories/:id/like', (request, response) => {
  const {
    params: { id },
  } = request;

  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id === id
  );

  if (repositoryIndex < 0)
    return response.status(404).json({ error: 'Repository not found' });

  const repository = repositories[repositoryIndex];

  const likes = ++repositories[repositoryIndex].likes;

  repository.likes = likes;

  return response.json(repository);
});

app.put('/repositories/:id', checkIfRepositoryExists, (request, response) => {
  const {
    params: { id: reposirotyIdToFind },
    body,
  } = request;

  const repositoryIndex = repositories.findIndex(
    ({ id }) => id === reposirotyIdToFind
  );

  if (repositoryIndex < 0)
    return response.status(404).json({ error: 'Repository not found' });

  const oldRepository = repositories[repositoryIndex];
  /* const a = buildRepositoryToUpdate(body);
  console.log('responsedo build::', a);
 */
  let updatedRepository = {};

  if (body.url) updatedRepository.url = body.url;
  if (body.title) updatedRepository.title = body.title;
  if (body.techs && body.techs.length > 0) updatedRepository.techs = body.techs;

  const newRepository = { ...oldRepository, ...updatedRepository };

  repositories[repositoryIndex] = newRepository;

  return response.json(newRepository);
});

app.delete(
  '/repositories/:id',
  checkIfRepositoryExists,
  (request, response) => {
    const {
      params: { id: repositoryIdToFind },
    } = request;

    const repositoryIndex = repositories.findIndex(
      ({ id }) => id === repositoryIdToFind
    );

    if (repositoryIndex < 0)
      return response.status(404).json({ error: 'Repository not found' });

    repositories.splice(repositoryIndex, 1);

    return response.status(204).send();
  }
);

module.exports = app;
