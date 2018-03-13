import { eachAsync } from '@didie/utils'
import * as MarkdownIt from 'markdown-it'
import { parse, render } from 'mustache'
import { fs } from 'mz'
import { extname } from 'path'

import { CoreService } from '../../core-service'

export class TemplateService extends CoreService {

  private templates: Record<string, string> = {}
  private renderers: Record<string, (vars: Record<string, any>) => Promise<string>> = {}
  private md!: MarkdownIt.MarkdownIt

  async beforeInit() {
    if (this.config.template && this.config.template.templates) {
      await eachAsync<string>(this.config.template.templates, (file, name) => this.load(name, file))
    }
    this.md = new MarkdownIt()
  }

  async load(name: string, file: string): Promise<void> {
    const buffer = await fs.readFile(file)
    const template = buffer.toString()
    const ext = extname(file)
    this.templates[name] = template
    this.renderers[name] = this.compileTemplate(ext, template)
  }

  async render(name: string, vars?: Record<string, any>): Promise<string> {
    const renderer = this.renderers[name]
    if (!renderer) throw new Error('Unknown Template')
    return renderer(vars || {})
  }

  private compileTemplate(ext: string, template: string): (vars: Record<string, any>) => Promise<string> {
    switch (ext) {
    case '.markdown':
    case '.md':
      parse(template)
      return async (vars: Record<string, any>) => {
        const mdInput = render(template, vars, this.templates)
        return this.md.render(mdInput)
      }
    default:
      parse(template)
      return async (vars: Record<string, any>) => render(template, vars, this.templates)
    }
  }

}
