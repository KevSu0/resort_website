import { logger } from '../../lib/logger';

export interface TemplateContext {
  [key: string]: unknown;
  brand?: {
    id: string;
    name: string;
    logo?: string;
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    fonts?: {
      primary?: string;
      secondary?: string;
    };
  };
  site?: {
    id: string;
    name: string;
    domain?: string;
    url?: string;
  };
  page?: {
    title?: string;
    description?: string;
    url?: string;
    publishedAt?: Date;
  };
  user?: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
  };
  date?: {
    now: Date;
    format: string;
  };
  config?: Record<string, unknown>;
}

export interface TemplateError {
  line: number;
  column: number;
  message: string;
  type: 'syntax' | 'runtime';
}

export interface TemplateRenderOptions {
  strict?: boolean;
  allowUnsafe?: boolean;
  maxDepth?: number;
  timeout?: number;
  helpers?: Record<string, (...args: unknown[]) => unknown>;
  partials?: Record<string, string>;
}

class TemplateEngine {
  private helpers: Record<string, (...args: unknown[]) => unknown> = {
    // Date helpers
    formatDate: (date: Date | string) => {
      const d = new Date(date);
      return d.toLocaleDateString();
    },
    formatTime: (date: Date | string) => {
      const d = new Date(date);
      return d.toLocaleTimeString();
    },
    now: () => new Date(),

    // String helpers
    uppercase: (str: string) => str?.toUpperCase(),
    lowercase: (str: string) => str?.toLowerCase(),
    capitalize: (str: string) => str?.charAt(0).toUpperCase() + str?.slice(1).toLowerCase(),
    truncate: (str: string, length: number = 100) => {
      if (!str) return '';
      return str.length > length ? str.substring(0, length) + '...' : str;
    },
    default: (value: unknown, defaultValue: unknown) => value !== null && value !== undefined ? value : defaultValue,

    // Conditional helpers
    eq: (a: unknown, b: unknown) => a === b,
    ne: (a: unknown, b: unknown) => a !== b,
    gt: (a: number, b: number) => a > b,
    lt: (a: number, b: number) => a < b,
    gte: (a: number, b: number) => a >= b,
    lte: (a: number, b: number) => a <= b,

    // Array helpers
    length: (arr: unknown[] | string) => arr?.length || 0,
    first: (arr: unknown[]) => arr?.[0],
    last: (arr: unknown[]) => arr?.[arr?.length - 1],
    join: (arr: string[], separator: string = ', ') => arr?.join(separator),

    // Math helpers
    add: (a: number, b: number) => a + b,
    subtract: (a: number, b: number) => a - b,
    multiply: (a: number, b: number) => a * b,
    divide: (a: number, b: number) => b !== 0 ? a / b : 0,

    // URL helpers
    asset: (path: string, cdn?: string) => {
      const baseUrl = cdn || '/assets';
      return `${baseUrl}/${path.replace(/^\//, '')}`;
    },
    url: (path: string, siteUrl?: string) => {
      const baseUrl = siteUrl || '';
      return `${baseUrl}/${path.replace(/^\//, '')}`;
    },

    // JSON helpers
    json: (obj: unknown, pretty: boolean = false) => {
      try {
        return JSON.stringify(obj, null, pretty ? 2 : 0);
      } catch {
        return '{}';
      }
    },

    // Debug helper
    debug: (value: unknown) => {
      logger.debug('Template Debug', {
        module: 'TemplateEngine',
        function: 'debug',
        value,
        category: 'template'
      });
      return '';
    },
  };

  private partials: Record<string, string> = {};

  compile(template: string): (context: TemplateContext) => string {
    // This is a simplified template compiler
    // In production, you'd want to use a proper Handlebars-like compiler
    return (context: TemplateContext) => this.render(template, context);
  }

  render(template: string, context: TemplateContext, options: TemplateRenderOptions = {}): string {
    const {
      strict = false,
      maxDepth = 10,
      helpers = {},
      partials = {},
    } = options;

    // Merge custom helpers and partials
    const allHelpers = { ...this.helpers, ...helpers };
    const allPartials = { ...this.partials, ...partials };

    let result = template;
    let depth = 0;

    // Simple regex-based template rendering
    // {{variable}} - Simple variable interpolation
    result = result.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
      if (depth > maxDepth) {
        throw new Error(`Maximum template depth (${maxDepth}) exceeded`);
      }
      depth++;

      try {
        const trimmed = expression.trim();

        // Handle helpers with parameters: {{helper arg1 arg2}}
        if (allHelpers[trimmed.split(' ')[0]]) {
          return this.renderHelper(trimmed, context, allHelpers);
        }

        // Handle simple variables: {{variable}}
        return this.getVariableValue(trimmed, context, strict);
      } catch (error) {
        if (strict) {
          throw error;
        }
        return '';
      }
    });

    // Handle blocks: {{#if condition}}...{{/if}}
    result = this.renderBlocks(result, context, allHelpers, allPartials, strict, maxDepth);

    return result;
  }

  private renderHelper(expression: string, context: TemplateContext, helpers: Record<string, (...args: unknown[]) => unknown>): string {
    const [helperName, ...args] = expression.trim().split(/\s+/);
    const helper = helpers[helperName];

    if (!helper) {
      throw new Error(`Helper "${helperName}" not found`);
    }

    const processedArgs = args.map(arg => {
      // Handle string literals
      if (arg.startsWith('"') && arg.endsWith('"')) {
        return arg.slice(1, -1);
      }
      if (arg.startsWith("'") && arg.endsWith("'")) {
        return arg.slice(1, -1);
      }

      // Handle variables
      return this.getVariableValue(arg, context, false);
    });

    try {
      return String(helper(...processedArgs));
    } catch (error) {
      logger.error(`Error in helper "${helperName}"`, {
        module: 'TemplateEngine',
        function: 'renderHelper',
        helperName,
        error: error instanceof Error ? error.message : String(error),
        category: 'template'
      });
      return '';
    }
  }

  private getVariableValue(path: string, context: TemplateContext, strict: boolean = false): string {
    const keys = path.split('.');
    let value: unknown = context;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        if (strict) {
          throw new Error(`Variable "${path}" not found in context`);
        }
        return '';
      }
    }

    return String(value !== null && value !== undefined ? value : '');
  }

  private renderBlocks(
    template: string,
    context: TemplateContext,
    helpers: Record<string, (...args: unknown[]) => unknown>,
    partials: Record<string, string>,
    strict: boolean,
    maxDepth: number
  ): string {
    let result = template;

    // Handle {{#if condition}}...{{/if}} blocks
    result = result.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
      const conditionValue = this.getVariableValue(condition.trim(), context, strict);
      const isTruthy = conditionValue !== 'false' && conditionValue !== '0' && conditionValue !== '';

      if (isTruthy) {
        return this.render(content, context, { strict, helpers, partials, maxDepth });
      }

      // Handle {{else}} within if blocks
      const elseMatch = content.match(/\{\{else\}\}([\s\S]*)$/);
      if (elseMatch) {
        return this.render(elseMatch[1], context, { strict, helpers, partials, maxDepth });
      }

      return '';
    });

    // Handle {{#unless condition}}...{{/unless}} blocks
    result = result.replace(/\{\{#unless\s+([^}]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g, (match, condition, content) => {
      const conditionValue = this.getVariableValue(condition.trim(), context, strict);
      const isFalsy = conditionValue === 'false' || conditionValue === '0' || conditionValue === '';

      if (isFalsy) {
        return this.render(content, context, { strict, helpers, partials, maxDepth });
      }

      return '';
    });

    // Handle {{#each array}}...{{/each}} blocks
    result = result.replace(/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayPath, content) => {
      const arrayValue = this.getVariableValue(arrayPath.trim(), context, strict);
      let array = [];

      try {
        array = JSON.parse(arrayValue);
      } catch {
        // If not JSON, treat as single item
        array = [arrayValue];
      }

      if (!Array.isArray(array)) {
        return '';
      }

      return array.map((item, index) => {
        const itemContext = {
          ...context,
          this: item,
          '@index': index,
          '@first': index === 0,
          '@last': index === array.length - 1,
        };

        return this.render(content, itemContext, { strict, helpers, partials, maxDepth });
      }).join('');
    });

    // Handle {{#with object}}...{{/with}} blocks
    result = result.replace(/\{\{#with\s+([^}]+)\}\}([\s\S]*?)\{\{\/with\}\}/g, (match, objectPath, content) => {
      const objectValue = this.getVariableValue(objectPath.trim(), context, strict);
      let object = {};

      try {
        object = JSON.parse(objectValue);
      } catch {
        return '';
      }

      const withContext = { ...context, ...object };
      return this.render(content, withContext, { strict, helpers, partials, maxDepth });
    });

    // Handle {{> partialName}} includes
    result = result.replace(/\{\{>\s*([^}]+)\s*\}\}/g, (match, partialName) => {
      const partial = partials[partialName.trim()];
      if (!partial) {
        if (strict) {
          throw new Error(`Partial "${partialName}" not found`);
        }
        return '';
      }

      return this.render(partial, context, { strict, helpers, partials, maxDepth });
    });

    return result;
  }

  registerHelper(name: string, helper: (...args: unknown[]) => unknown): void {
    this.helpers[name] = helper;
  }

  registerPartial(name: string, template: string): void {
    this.partials[name] = template;
  }

  validateTemplate(template: string): TemplateError[] {
    const errors: TemplateError[] = [];
    const lines = template.split('\n');

    // Basic syntax validation
    lines.forEach((line, lineIndex) => {
      const lineNumber = lineIndex + 1;

      // Check for unclosed blocks
      const openBlocks = (line.match(/\{\{#[^}]+\}\}/g) || []).length;
      const closeBlocks = (line.match(/\{\{\/[^}]+\}\}/g) || []).length;

      if (openBlocks > closeBlocks) {
        errors.push({
          line: lineNumber,
          column: 1,
          message: 'Unclosed block detected',
          type: 'syntax',
        });
      }

      // Check for malformed expressions
      const malformed = line.match(/\{\{[^}]*$/g);
      if (malformed) {
        errors.push({
          line: lineNumber,
          column: line.indexOf(malformed[0]) + 1,
          message: 'Malformed template expression',
          type: 'syntax',
        });
      }
    });

    return errors;
  }

  extractVariables(template: string): string[] {
    const variables = new Set<string>();

    // Extract simple variables
    const simpleVars = template.match(/\{\{([^#/][^}]*)\}\}/g) || [];
    simpleVars.forEach(match => {
      const variable = match.replace(/[{}]/g, '').trim();
      // Exclude helpers and complex expressions
      if (!variable.includes(' ') && !this.helpers[variable.split('.')[0]]) {
        variables.add(variable);
      }
    });

    return Array.from(variables);
  }

  extractHelpers(template: string): string[] {
    const helpers = new Set<string>();

    // Extract helper calls
    const helperCalls = template.match(/\{\{([^}]*)\}\}/g) || [];
    helperCalls.forEach(match => {
      const expression = match.replace(/[{}]/g, '').trim();
      const firstWord = expression.split(/\s+/)[0];

      if (this.helpers[firstWord]) {
        helpers.add(firstWord);
      }
    });

    return Array.from(helpers);
  }

  createTemplateFromSchema(schema: unknown): string {
    // Convert a JSON schema to a template string
    // This is useful for generating templates from structured data
    if (typeof schema === 'string') {
      return schema;
    }

    if (Array.isArray(schema)) {
      return schema.map(item => this.createTemplateFromSchema(item)).join('\n');
    }

    if (typeof schema === 'object' && schema !== null) {
      const schemaObj = schema as Record<string, unknown>;
      const template = (schemaObj.template as string) || '';
      const variables = (schemaObj.variables as Record<string, unknown>) || {};

      let result = template;
      Object.entries(variables).forEach(([key, config]: [string, unknown]) => {
        const placeholder = `{{${key}}}`;
        const configObj = config as Record<string, unknown>;
        if (configObj.default) {
          result = result.replace(placeholder, `{{${key} | default '${configObj.default}'}}`);
        }
      });

      return result;
    }

    return String(schema);
  }
}

export const templateEngine = new TemplateEngine();
export { TemplateEngine };