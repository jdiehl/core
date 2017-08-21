jest.unmock('mz')

import { ITemplateConfig, TemplateService } from '../'
import { IMock, mock } from './util'

const config: ITemplateConfig = { templates: {
  markdown: 'test/resources/markdown.md',
  mustache: 'test/resources/mustache.mst'
} }
let m: IMock
let template: TemplateService

beforeEach(async () => {
  m = mock({ template: config }, 'template')
  template = m.services.template as any
  await m.app.init()
})

afterEach(async () => {
  await m.app.destroy()
})

test('should render a mustache template', async () => {
  const vars = {
    greeting: 'Hello',
    items: ['a', 'b'],
    person: { first: 'John', last: 'Doe' }
  }
  const res = await template.render('mustache', vars)
  expect(res).toBe(`Hello John Doe\nDon't forget:\n* a\n* b\n`)
})

test('should load and render a mustache template', async () => {
  await template.load('partial', 'test/resources/partial.mst')
  const res = await template.render('partial', { greeting: 'Hi' })
  expect(res).toBe(`Hi from the partial!\n`)
})

test('should load and render a mustache partial', async () => {
  await template.load('partial', 'test/resources/partial.mst')
  const vars = {
    greeting: 'Hello',
    items: ['x'],
    person: { first: 'Tom', last: 'Smith' }
  }
  const res = await template.render('mustache', vars)
  expect(res).toBe(`Hello Tom Smith\nDon't forget:\n* x\nHello from the partial!\n`)
})

test('should render a markdown template', async () => {
  const vars = {
    items: ['a', 'b'],
    person: { first: 'John', last: 'Doe' }
  }
  const res = await template.render('markdown', vars)
  expect(res).toBe(`<h1>Hello John Doe</h1>
<p><strong>Don't forget:</strong></p>
<ul>\n<li>a</li>\n<li>b</li>\n</ul>\n`)
})

test('should render a markdown template with a partial', async () => {
  await template.load('partial', 'test/resources/partial.mst')
  const vars = {
    greeting: 'Howdy',
    items: ['x', 'y'],
    person: { first: 'Tom', last: 'Smith' }
  }
  const res = await template.render('markdown', vars)
  expect(res).toBe(`<h1>Hello Tom Smith</h1>
<p><strong>Don't forget:</strong></p>
<ul>\n<li>x</li>\n<li>y</li>\n</ul>
<p>Howdy from the partial!</p>\n`)
})
