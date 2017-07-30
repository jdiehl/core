'use strict'

const { mockResolve } = require('../util')

const mongo = jest.genMockFromModule('mongodb')

const cur = mongo.__cursor = {
  count: jest.fn(),
  filter: jest.fn(),
  limit: jest.fn(),
  map: jest.fn(),
  next: jest.fn(),
  project: jest.fn(),
  skip: jest.fn(),
  sort: jest.fn(),
  toArray: jest.fn()
}

const col = mongo.__collection = {
  count: jest.fn(),
  createIndex: jest.fn(),
  deleteMany: jest.fn(),
  deleteOne: jest.fn(),
  drop: jest.fn(),
  dropIndex: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  insertMany: jest.fn(),
  insertOne: jest.fn(),
  updateMany: jest.fn(),
  updateOne: jest.fn()
}

const client = mongo.__client = {
  close: jest.fn(),
  collection: jest.fn(),
  dropCollection: jest.fn()
}

mongo.MongoClient = {
  connect: jest.fn()
}

mongo.__reset = () => {
  cur.count.mockImplementation(mockResolve()).mockClear()
  cur.filter.mockReturnValue(cur).mockClear()
  cur.limit.mockReturnValue(cur).mockClear()
  cur.map.mockReturnValue(cur).mockClear()
  cur.next.mockImplementation(mockResolve()).mockClear()
  cur.project.mockReturnValue(cur).mockClear()
  cur.skip.mockReturnValue(cur).mockClear()
  cur.sort.mockReturnValue(cur).mockClear()
  cur.toArray.mockImplementation(mockResolve([{ _id: 'id1' }, { _id: 'id2' }])).mockClear()
  col.count.mockImplementation(mockResolve()).mockClear()
  col.createIndex.mockImplementation(mockResolve()).mockClear()
  col.deleteMany.mockImplementation(mockResolve({ deletedCount: 2 })).mockClear()
  col.deleteOne.mockImplementation(mockResolve({ deletedCount: 1 })).mockClear()
  col.drop.mockImplementation(mockResolve()).mockClear()
  col.dropIndex.mockImplementation(mockResolve()).mockClear()
  col.find.mockImplementation().mockReturnValue(cur).mockClear()
  col.findOne.mockImplementation(mockResolve({ _id: 'id1' })).mockClear()
  col.insertMany.mockImplementation(mockResolve({ insertedCount: 2, insertedIds: ['id1', 'id2'] })).mockClear()
  col.insertOne.mockImplementation(mockResolve({ insertedCount: 1, insertedId: 'id1' })).mockClear()
  col.updateMany.mockImplementation(mockResolve({ modifiedCount: 2 })).mockClear()
  col.updateOne.mockImplementation(mockResolve({ modifiedCount: 1 })).mockClear()
  client.close.mockImplementation(mockResolve()).mockClear()
  client.collection.mockReturnValue(col).mockClear()
  client.dropCollection.mockImplementation(mockResolve()).mockClear()
  mongo.MongoClient.connect.mockImplementation(mockResolve(client)).mockClear()
}
mongo.__reset()

module.exports = mongo
