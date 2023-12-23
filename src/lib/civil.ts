/* CIVIL
 
Example usage:

  const M = globalThis.main = civil_program()

  M.args(1, 2)
  M.focus(M.function(
   'number', 'number', 'number',
   (a, b) => a + b
  ))
  M.call()
  M.args('The sum of 1 and 2 is')
  M.focusArg()
  M.get('console', 'log')
  M.call()

  console.log('final types', M.program.verify())
  M.program.run(globalThis)
*/

export const civil_instruction_names = [
 'args',
 'call',
 'exists',
 'focus',
 'focus_arg',
 'focus_function',
 'function_arg',
 'get',
 'set',
]

export function civil_type_of(value: any) {
 if (
  value &&
  typeof value === 'object' &&
  '#type' in value
 ) {
  return value
 }
 const js_type = typeof value
 switch (js_type) {
  case 'boolean':
  case 'number':
  case 'string':
  case 'undefined':
  case 'function':
   return js_type
  case 'object':
   if (value === null) {
    return 'null'
   }
   if (Array.isArray(value)) {
    return {
     '#type': 'array',
     items: value.map(civil_type_of),
    }
   }
   return {
    '#type': 'object',
    properties: Object.fromEntries(
     Object.entries(value).map(([k, v]) => [
      k,
      civil_type_of(v),
     ])
    ),
   }
  default:
   console.info(value)
   throw new Error(
    `cannot understand this ${JSON.stringify(
     js_type
    )}`
   )
 }
}

export const civil_keyboard_event_type = {
 '#type': 'object',
 properties: {
  key: 'string',
  altKey: 'boolean',
  ctrlKey: 'boolean',
  metaKey: 'boolean',
  shiftKey: 'boolean',
 },
}

export const civil_mouse_event_type = {
 '#type': 'object',
 properties: {
  clientX: 'number',
  clientY: 'number',
 },
}

export const civil_event_callback_type = {
 '#type': 'function',
 argument_names: ['event'],
 argument_types: [
  [
   civil_keyboard_event_type,
   civil_mouse_event_type,
  ],
 ],
 return_type: 'undefined',
}

export const civil_element_type = {
 '#type': 'object',
 properties: {
  addEventListener: {
   '#type': 'function',
   argument_names: ['event', 'handler'],
   argument_types: [
    'string',
    civil_event_callback_type,
   ],
   return_type: 'undefined',
  },
  appendChild: {
   '#type': 'function',
   argument_types: [
    /* placeholder for circular reference to civil_element_type */ undefined,
   ] as unknown[],
   return_type: 'undefined',
  },
  classList: {
   '#type': 'object',
   properties: {
    add: {
     '#type': 'function',
     argument_types: [['string']],
     return_type: 'undefined',
    },
    remove: {
     '#type': 'function',
     argument_types: [['string']],
     return_type: 'undefined',
    },
    toggle: {
     '#type': 'function',
     argument_types: [['string']],
     return_type: 'undefined',
    },
   },
  },
  getAttribute: {
   '#type': 'function',
   argument_names: ['name'],
   argument_types: ['string'],
   return_type: ['string', 'null'],
  },
  hasAttribute: {
   '#type': 'function',
   argument_names: ['name'],
   argument_types: ['string'],
   return_type: 'boolean',
  },
  setAttribute: {
   '#type': 'function',
   argument_names: ['name', 'value'],
   argument_types: [
    'string',
    ['string', 'undefined'],
   ],
   return_type: 'undefined',
  },
  tagName: 'string',
 },
}

civil_element_type.properties.appendChild.argument_types[0] =
 civil_element_type

export const civil_type = {
 '#type': 'object',
 properties: {
  validate_line: {
   '#type': 'function',
   argument_names: [
    'line',
    'base_type',
    'type_state',
   ],
   argument_types: [
    { '#type': 'array', items: 'string' },
    'type',
    {
     '#type': 'object',
     properties: {
      args: 'type',
      focus: 'type',
     },
    },
   ],
   return_type: {
    '#type': 'object',
    properties: {
     error: ['string', 'undefined'],
     type_state: {
      '#type': 'object',
      args: 'type',
      focus: 'type',
     },
     args_string: 'string',
     focus_string: 'string',
    },
   },
  },
 },
}

export const civil_global_this_type = {
 '#type': 'object',
 properties: {
  civil: civil_type,
  console: {
   '#type': 'object',
   properties: {
    log: {
     '#type': 'function',
     argument_types: [['any']],
     return_type: 'undefined',
    },
   },
  },
  document: {
   '#type': 'object',
   properties: {
    body: civil_element_type,
    createElement: {
     '#type': 'function',
     argument_types: ['string'],
     return_type: civil_element_type,
    },
   },
  },
  Object: {
   '#type': 'function',
   argument_types: [],
   return_type: {
    '#type': 'object',
    properties: {},
   },
  },
 },
}

export const civil_array_prototype_type = {
 '#type': 'object',
 properties: {
  forEach: {
   '#type': 'function',
   argument_names: ['callback'],
   argument_types: ['function'],
   return_type: 'undefined',
  },
 },
}

const civil_number_prototype_type = {
 '#type': 'object',
 properties: {
  toString: {
   '#type': 'function',
   argument_names: ['base'],
   argument_types: ['number'],
   return_type: 'string',
  },
 },
}

/*used for debugging*#/
function civil_types_incompatible(a, b) {
 const incompat = _civil_types_incompatible(a, b)
 console.log('COMPARE', JSON.stringify(a), JSON.stringify(b), 'RESULT', incompat ? incompat : 'OK')
 return incompat
}/**/

export function /**#/_/**/ civil_types_incompatible(
 a: any,
 b: any,
 suppress_warnings = false
) {
 if (b === 'any') {
  return undefined
 }
 if (typeof b === 'string') {
  switch (b) {
   case 'type':
    return typeof a === 'string' ||
     typeof a?.['#type'] === 'string'
     ? undefined
     : `expecting type to be string | { #type: string }, got '${a}' instead`
   case 'number':
   case 'string':
   case 'boolean':
   case 'undefined':
   case 'null':
    /**/ if (!suppress_warnings && a !== b) {
     console.info(a, 'is not equal to', b)
    } /**/
    return a === b
     ? undefined
     : `expecting ${civil_type_string(
        a
       )} to be ${civil_type_string(b)}`
   case 'object':
    if (
     a === 'object' ||
     a?.['#type'] === 'object'
    ) {
     return undefined
    }
    return `expecting ${JSON.stringify(
     a
    )} to be ${JSON.stringify(b)}`
   default:
    return a === b // string literals must match
  }
 }
 if (!Array.isArray(a)) {
  if (Array.isArray(b)) {
   return b.some(
    (x) =>
     !civil_types_incompatible(
      a,
      x,
      suppress_warnings
     )
   )
    ? undefined
    : `type ${JSON.stringify(
       a
      )} matched none of the types in ${JSON.stringify(
       b
      )}`
  }
  if (
   typeof a === 'object' &&
   typeof b === 'object' &&
   a['#type'] === 'array' &&
   b['#type'] === 'array'
  ) {
   const a_items_type = Array.isArray(a.items)
    ? a.items
    : [[a.items]]
   const b_items_type = Array.isArray(b.items)
    ? b.items
    : [[b.items]]
   let arr_array_arg: any = undefined
   let arr_max_consumed_b = -1
   const found_incompatibility = any(
    'both types are arrays, but encountered a problem: ',
    a_items_type,
    function (type: any, i: number) {
     if (Array.isArray(type)) {
      arr_max_consumed_b = i
      return civil_types_incompatible(
       type,
       b_items_type[i],
       suppress_warnings
      )
     }
     if (arr_array_arg) {
      return arr_array_arg.some(
       (x: any) =>
        !civil_types_incompatible(
         type,
         x,
         suppress_warnings
        )
      )
       ? undefined
       : `type ${JSON.stringify(
          type
         )} matched none of the types in ${JSON.stringify(
          arr_array_arg
         )}`
     }
     if (Array.isArray(b_items_type[i])) {
      arr_array_arg = b_items_type[i]
      arr_max_consumed_b = i
      return arr_array_arg.some(
       (x: any) =>
        !civil_types_incompatible(
         type,
         x,
         suppress_warnings
        )
      )
       ? undefined
       : `type ${JSON.stringify(
          type
         )} matched none of the types in ${JSON.stringify(
          arr_array_arg
         )}`
     }
     arr_max_consumed_b = i
     return civil_types_incompatible(
      type,
      b_items_type[i],
      suppress_warnings
     )
    }
   )

   if (found_incompatibility) {
    return found_incompatibility
   }

   return arr_max_consumed_b ===
    b_items_type.length - 1
    ? undefined
    : `${
       b_items_type.length -
       1 -
       arr_max_consumed_b
      } leftover array item(s) not matched in incoming type`
  }
  if (
   typeof a === 'object' &&
   typeof b === 'object' &&
   a['#type'] === 'function' &&
   b['#type'] === 'function'
  ) {
   const incompat_return =
    civil_types_incompatible(
     a.return_type,
     b.return_type,
     suppress_warnings
    )
   const incompat_args =
    civil_types_incompatible(
     a.argument_types,
     b.argument_types,
     suppress_warnings
    )
   if (incompat_return || incompat_args) {
    return [
     incompat_return
      ? `incompatible return types: ${incompat_return}`
      : undefined,
     incompat_args
      ? `incompatible argument types: ${incompat_args}`
      : undefined,
    ]
     .filter((x) => x)
     .join('\n')
   }
   return undefined
  }
  if (
   typeof a === 'object' &&
   typeof b === 'object' &&
   a['#type'] === 'object' &&
   b['#type'] === 'object'
  ) {
   if (a === b) {
    return undefined
   }
   const keys_a = Object.keys(a.properties)
   const keys_b = Object.keys(b.properties)
   const extra = keys_a.filter(
    (x) => !keys_b.includes(x)
   )
   const missing = keys_b.filter(
    (x) => !keys_a.includes(x)
   )
   if (extra.length + missing.length > 0) {
    return `object property keys mismatch ${JSON.stringify(
     {
      extra,
      missing,
     }
    )}`
   }
   return any(
    'object property',
    keys_b,
    function (key) {
     const property_incompat =
      civil_types_incompatible(
       a.properties[key],
       b.properties[key],
       suppress_warnings
      )
     if (property_incompat) {
      return `key ${JSON.stringify(
       key
      )}: ${property_incompat}`
     }
    }
   )
  }
  /*if (a !== b) {
   console.info(a, 'is not equal to', b)
  }*/
  return a === b
   ? undefined
   : `expecting ${a} to be ${b}`
 }
 function any(
  prefix: string,
  arr: any[],
  fn: (x: any, i: number) => string | undefined
 ) {
  let output: any
  let incompat_index: number
  arr.some((x: any, i: number) => {
   output = fn(x, i)
   if (output) {
    incompat_index = i
   }
   return output ? true : false
  })
  return output
   ? prefix +
      `in array[${incompat_index!}]: ${output}`
   : undefined
 }
 let array_arg: any = undefined
 let max_consumed_b = -1
 const found_incompatibility = any(
  '',
  a,
  function (type: any, i: number) {
   if (array_arg) {
    return array_arg.some(
     (x: any) =>
      !civil_types_incompatible(type, x)
    )
     ? undefined
     : `none of the types in ${array_arg} matched ${type}`
   }
   if (Array.isArray(type)) {
    if (!Array.isArray(b[i])) {
     console.log(
      `todo array in input: ${JSON.stringify(
       type
      )} but not in type`
     )
     return 'todo'
    }
    max_consumed_b = i
    return civil_types_incompatible(type, b[i])
   }
   if (Array.isArray(b[i])) {
    array_arg = b[i]
    max_consumed_b = i
    return array_arg.some(
     (x: any) =>
      !civil_types_incompatible(type, x)
    )
     ? undefined
     : `none of the types in ${array_arg} matched ${type}`
   }
   max_consumed_b = i
   return civil_types_incompatible(type, b[i])
  }
 )

 if (found_incompatibility) {
  return found_incompatibility
 }

 return max_consumed_b === b.length - 1
  ? undefined
  : `${
     b.length - 1 - max_consumed_b
    } leftover array item(s) not matched in incoming type`
}

export interface CivilTypeState {
 args: any[]
 focus: any
}

export const civil = {
 validate_line(
  line: string[],
  base_type: any,
  type_state: CivilTypeState
 ) {
  console.log('about to validate', line)
  const root_type = civil_clone_type(base_type)
  const root_type_state =
   civil_clone_type(type_state)
  const validator = civil_program(
   root_type,
   [[line[0], line.slice(1)]],
   root_type_state
  )
  const args_string = civil_type_string(
   root_type_state.args
  )
  const focus_string = civil_type_string(
   root_type_state.focus
  )
  try {
   const error = validator.program.verify()
   return {
    error,
    type_state: root_type,
    args_string,
    focus_string,
   }
  } catch (error) {
   return {
    error,
    type_state: root_type,
    args_string,
    focus_string,
   }
  }
 },
}

export function civil_extract_type(
 type: any,
 path: string[]
) {
 let current = type
 for (const segment of path) {
  if (
   typeof current === 'object' &&
   current['#type'] === 'array'
  ) {
   current =
    civil_array_prototype_type.properties[
     segment
    ]
   continue
  }
  if (current === 'number') {
   current =
    civil_number_prototype_type.properties[
     segment
    ]
   continue
  }
  if (
   typeof current !== 'object' ||
   current['#type'] !== 'object'
  ) {
   throw new Error(
    `cannot get ${JSON.stringify(
     segment
    )} of ${current} in path ${JSON.stringify(
     path
    )}`
   )
  }
  current = current.properties[segment]
 }
 return current
}

function civil_type_string(type: any) {
 if (Array.isArray(type)) {
  return ['[']
   .concat(type.map(civil_type_string))
   .concat(']')
   .join(' ')
 }
 if (typeof type === 'object') {
  switch (type['#type']) {
   case 'array':
    if (!Array.isArray(type.items)) {
     return `${civil_type_string(type.items)}[]`
    }
    return ['[']
     .concat(type.items.map(civil_type_string))
     .concat(']')
     .join(' ')
   case 'function':
    return [
     'function',
     civil_type_string(type.argument_types),
    ]
     .concat([
      '=>',
      civil_type_string(type.return_type),
     ])
     .join(' ')
   case 'object':
    return `object(${Object.keys(
     type.properties
    ).join(' ')})`
  }
 }
 if (
  typeof type === 'string' ||
  typeof type === 'function'
 ) {
  return type
 }
 console.error(type)
 throw new Error(
  `unknown type: ${typeof type} ${JSON.stringify(
   type
  )}`
 )
}

function civil_extend_type_with_property(
 base_type: any,
 _path: string[],
 type: any
) {
 const path = _path.slice(0)
 const last_segment = path.pop()
 if (!last_segment) {
  throw new Error(
   'path must contain at least one segment'
  )
 }
 if (
  base_type?.['#type'] !== 'object' ||
  !base_type?.properties
 ) {
  throw new Error(
   `type to extend is not an "object", instead got ${civil_type_string(
    base_type
   )}`
  )
 }
 let context = base_type.properties
 for (const segment of path) {
  if (
   typeof context === 'undefined' ||
   context === null
  ) {
   throw new Error(
    `cannot read property ${JSON.stringify(
     segment
    )} of ${context}`
   )
  }
  if (
   context[segment]?.['#type'] !== 'object' ||
   !context[segment]?.properties
  ) {
   throw new Error(
    `property ${JSON.stringify(
     segment
    )} of ${context} is not an "object", instead got ${civil_type_string(
     context[segment]
    )}`
   )
  }
  context = context[segment].properties
 }
 if (
  typeof context === 'undefined' ||
  context === null
 ) {
  throw new Error(
   `cannot set property ${JSON.stringify(
    last_segment
   )} of ${context}`
  )
 }
 context[last_segment] = type
}

function civil_set_property(
 scope: object,
 _path: string[],
 input: any
) {
 const path = _path.slice(0)
 const last_segment = path.pop()
 if (!last_segment) {
  throw new Error(
   'path must contain at least one segment'
  )
 }
 let context = scope
 for (const segment of path) {
  if (
   typeof context === 'undefined' ||
   context === null
  ) {
   throw new Error(
    `cannot read property ${JSON.stringify(
     segment
    )} of ${context}`
   )
  }
  context = context[segment]
 }
 if (
  typeof context === 'undefined' ||
  context === null
 ) {
  throw new Error(
   `cannot set property ${JSON.stringify(
    last_segment
   )} of ${context}`
  )
 }
 context[last_segment] = input
}

function civil_type_has_non_undefined_non_null(
 type: any
) {
 if (Array.isArray(type)) {
  return type.some((x) =>
   civil_type_has_non_undefined_non_null(x)
  )
 }
 if (type === 'undefined') {
  return false
 }
 if (type === 'null') {
  return false
 }
 return true
}

function civil_type_union(types: any[]) {
 const final_types: any[] = []
 if (types.includes('any')) {
  return 'any'
 }
 for (const type of types) {
  if (typeof type === 'string') {
   if (
    final_types.length === 0 ||
    !final_types.includes(type)
   ) {
    // type is not equal to any type in final_types, so add it to the union array
    final_types.push(type)
   }
  } else if (
   final_types.length === 0 ||
   civil_types_incompatible(
    type,
    final_types,
    true
   )
  ) {
   // type is not compatible with any type in final_types, so add it to the union array
   final_types.push(type)
  }
 }
 // console.log('union', types, final_types)
 if (final_types.length === 0) {
  console.error(
   'types to create union from:',
   types
  )
  throw new Error(
   'union type must have at least one type'
  )
 }
 if (final_types.length === 1) {
  return final_types[0]
 }
 return final_types
}

export function civil_clone_type(a: any) {
 if (typeof a === 'object') {
  if (a === 'null') {
   return a
  }
  if (Array.isArray(a)) {
   return a.map(civil_clone_type)
  }
  if (a?.['#type'] !== 'object') {
   return a
  }
  return {
   '#type': 'object',
   properties: Object.fromEntries(
    Object.entries(a.properties ?? {}).map(
     ([k, v]) => [k, civil_clone_type(v)]
    )
   ),
  }
 }
 return a
}

export function civil_type_must_exist(a: any) {
 if (a === 'undefined') {
  throw new Error(
   'type must exist, but type is undefined'
  )
 }
 if (typeof a === 'object') {
  if (a === 'null') {
   throw new Error(
    'type must exist, but type is null'
   )
  }
  if (Array.isArray(a)) {
   const final_value = a
    .filter(
     (x) => x !== 'null' && x !== 'undefined'
    )
    .map(civil_type_must_exist)
   if (final_value.length === 1) {
    return final_value[0]
   }
   return final_value
  }
  return Object.fromEntries(
   Object.entries(a).map(([k, v]) => [
    k,
    civil_type_must_exist(v),
   ])
  )
 }
 return a
}

export type CivilErrorContext = [
 string,
 any[],
 CivilTypeState
]

export function civil_print_error_context(
 err_ctx: CivilErrorContext[]
) {
 for (const [name, args, types] of err_ctx) {
  console.info('.. focus:', types.focus)
  console.info('.. args: ', types.args)
  if (args) {
   console.error('>', name, ...args)
  } else {
   console.error('>', name)
  }
 }
}

export type CivilInstruction = [string, any[]]

export interface CivilRunResult {
 state: CivilTypeState
}

export interface CivilProgram {
 instructions: CivilInstruction[]
 run(scope?: object): CivilRunResult
 verify(): CivilTypeState
}

export type CivilArgCollector = (
 ...args: any[]
) => void

export interface CivilProgramRuntime {
 program: CivilProgram
 args: CivilArgCollector
 call: CivilArgCollector
 exists: CivilArgCollector
 focus: CivilArgCollector
 focus_arg: CivilArgCollector
 focus_function: CivilArgCollector
 function_arg: CivilArgCollector
 get: CivilArgCollector
 set: CivilArgCollector
}

export function civil_program(
 scope_type: any = civil_global_this_type,
 instructions?: CivilInstruction[],
 type_state?: { args: any; focus: any }
): CivilProgramRuntime {
 const program: CivilProgram = {
  instructions: instructions ?? [],
  verify() {
   const root_type_state = type_state ?? {
    args: {
     '#type': 'array',
     items: [],
    },
    focus: 'undefined',
   }
   const error_context = []

   function civil_extend_type(
    type_state: CivilTypeState,
    instructions: CivilInstruction[],
    error_context: any
   ) {
    const extended_type_state =
     civil_clone_type(type_state)
    for (const [name, args] of instructions) {
     run_statement(
      name,
      args,
      extended_type_state,
      error_context
     )
    }
    return extended_type_state
   }
   function run_statement(
    name: string,
    args: any[],
    type_state: CivilTypeState,
    err_ctx: CivilErrorContext[]
   ) {
    err_ctx.push([
     name,
     args,
     {
      args: civil_type_string(type_state.args),
      focus: civil_type_string(
       type_state.focus
      ),
     },
    ])
    if (err_ctx.length > 5) {
     err_ctx.shift()
    }
    switch (name) {
     case 'args':
      type_state.args = args.map(civil_type_of)
      break
     case 'call':
      if (
       typeof type_state.focus !== 'object' ||
       type_state.focus['#type'] !== 'function'
      ) {
       civil_print_error_context(err_ctx)
       throw new Error(
        `expecting typed function, got ${civil_type_of(
         type_state.focus
        )}`
       )
      }
      const incompatibility =
       civil_types_incompatible(
        type_state.args,
        type_state.focus.argument_types
       )
      if (incompatibility) {
       civil_print_error_context(err_ctx)
       console.warn(
        type_state.args,
        'vs',
        civil_type_string(
         type_state.focus.argument_types
        )
       )
       throw new Error(
        `${incompatibility}: cannot use arguments with type ${civil_type_string(
         type_state.args
        )} on function with argument of type ${civil_type_string(
         type_state.focus.argument_types
        )}`
       )
      }
      type_state.args = []
      if (!type_state.focus.return_type) {
       throw new Error(
        `function return type missing: ${type_state.focus.return_type}`
       )
      }
      type_state.focus =
       type_state.focus.return_type
      break
     case 'exists':
      const [run_if_exists, run_if_not_exists] =
       args
      const may_not_exist = [
       'undefined',
       'null',
      ].some(
       (x) =>
        civil_types_incompatible(
         x,
         type_state.focus,
         true
        ) === undefined
      )
      const may_exist =
       civil_type_has_non_undefined_non_null(
        type_state.focus
       )
      const type_state_if_exists = {
       args: civil_clone_type(type_state.args),
       focus: civil_type_must_exist(
        type_state.focus
       ),
      }
      const types_if_exists = may_exist
       ? [
          civil_extend_type(
           type_state_if_exists,
           run_if_exists,
           err_ctx.slice(0)
          ),
         ]
       : []
      const types_if_not_exists = may_not_exist
       ? [
          civil_extend_type(
           type_state,
           run_if_not_exists,
           err_ctx.slice(0)
          ),
         ]
       : []
      type_state.args = civil_type_union(
       [
        ...types_if_exists,
        ...types_if_not_exists,
       ].map((x) => x.args)
      )
      type_state.focus = civil_type_union(
       [
        ...types_if_exists,
        ...types_if_not_exists,
       ].map((x) => x.focus)
      )
      /** / console.log(
       type_state,
       { run_if_exists, run_if_not_exists, may_not_exist,
         may_exist, types_if_exists, types_if_not_exists
       }) /**/
      break
     case 'focus_arg':
      type_state.args.push(type_state.focus)
      break
     case 'focus':
      const detected_type = civil_type_of(
       args[0]
      )
      if (!detected_type) {
       throw new Error(
        `cannot detect type of ${args[0]}`
       )
      }
      type_state.focus = detected_type
      break
     case 'function':
     case 'focus_function':
     case 'function_arg':
      const [
       argument_names,
       argument_types,
       return_type,
       implementation,
      ] = args
      const function_type = {
       '#type': 'function',
       argument_names,
       argument_types,
       implementation,
       return_type,
      }
      if (name === 'function') {
       return function_type
      } else {
       if (!function_type) {
        throw new Error(
         `expecting function type ${civil_type_string(
          function_type
         )}`
        )
       }
       if (name === 'function_arg') {
        type_state.args.push(function_type)
       } else {
        type_state.focus = function_type
       }
      }
      if (Array.isArray(implementation)) {
       // console.log('should now verify code', implementation)
       const new_scope_type = {
        '#type': 'object',
        properties: { '..': scope_type },
       }
       for (const i in argument_names) {
        const argument_name = argument_names[i]
        const argument_type = argument_types[i]
        if (!argument_type) {
         throw new Error(
          `no type found for argument ${JSON.stringify(
           argument_name
          )}`
         )
        }
        new_scope_type.properties[
         argument_name
        ] = argument_type
       }
       const function_program = civil_program(
        new_scope_type,
        implementation
       )
       const real_return_type =
        function_program.program.verify().focus
       const code_incompat =
        civil_types_incompatible(
         real_return_type,
         return_type
        )
       if (code_incompat) {
        civil_print_error_context(err_ctx)
        throw new Error(
         `${code_incompat}: function code return ${civil_type_string(
          real_return_type
         )} does not match specified return type ${civil_type_string(
          return_type
         )}`
        )
       }
      }
      break
     case 'get':
      const extracted_type = civil_extract_type(
       scope_type,
       args
      )
      if (!extracted_type) {
       throw new Error(
        `expecting type for get ${JSON.stringify(
         args
        )}`
       )
      }
      type_state.focus = extracted_type
      break
     case 'set':
      const existing_type = civil_extract_type(
       scope_type,
       args
      )
      if (existing_type) {
       const set_incompat =
        civil_types_incompatible(
         type_state.focus,
         existing_type
        )
       if (set_incompat) {
        throw new Error(
         `can not change type of named value once set, attempted to set ${JSON.stringify(
          args
         )}: ${set_incompat}, ${civil_type_string(
          type_state.focus
         )} is not compatible with existing type ${civil_type_string(
          existing_type
         )}`
        )
       }
      }
      civil_extend_type_with_property(
       scope_type,
       args,
       type_state.focus
      )
      break
     default:
      civil_print_error_context(err_ctx)
      throw new Error(
       `unknown instruction '${name}'`
      )
    }
   }
   for (const [
    name,
    args,
   ] of program.instructions) {
    run_statement(
     name,
     args,
     root_type_state,
     error_context
    )
   }
   return root_type_state
  },
  run(
   scope: object = globalThis
  ): CivilRunResult {
   const runtime = civil_runtime(scope)
   for (const [
    name,
    args = [],
   ] of program.instructions) {
    if (
     name === 'focus_function' ||
     name === 'function_arg'
    ) {
     const impl = args[4] ?? args[3]
     if (Array.isArray(impl)) {
      args[4] = function (...innerArgs: any[]) {
       const new_scope = { '..': scope }
       const new_scope_type = {
        '#type': 'object',
        properties: { '..': scope_type },
       }
       for (const i in args[0]) {
        new_scope[args[0][i]] = innerArgs[i]
       }
       const sub_program = civil_program(
        new_scope_type,
        impl
        // innerArgs TODO
       )
       return sub_program.program.run(new_scope)
        .state.focus
      }
     }
    }
    runtime[name](...args)
   }
   return runtime
  },
 }
 const me = {
  program,
 } as unknown as CivilProgramRuntime
 function program_instruction(name: string) {
  return function (...args: any[]) {
   program.instructions.push([name, args])
  }
 }
 for (const instruction of civil_instruction_names) {
  me[instruction] =
   program_instruction(instruction)
 }
 // function _function( todo still need this?
 //  argument_names, // todo
 //  argument_types,
 //  return_type,
 //  implementation
 // ) {
 //  return {
 //   '#type': 'function',
 //   argument_names,
 //   argument_types,
 //   implementation,
 //   return_type,
 //  }
 // }
 return me
}

function civil_runtime(
 scope: object = globalThis
) {
 const state: CivilTypeState = {
  args: [],
  focus: undefined,
 }
 function args(...input: any[]) {
  me.state.args = input
 }
 function call() {
  me.state.focus = me.state.focus(
   ...me.state.args.splice(0)
  )
 }
 function exists(
  run_if_exists: CivilInstruction[],
  run_if_not_exists: CivilInstruction[]
 ) {
  if (focus === undefined || focus === null) {
   for (const [
    name,
    args,
   ] of run_if_not_exists) {
    me[name](...args)
   }
  } else {
   for (const [name, args] of run_if_exists) {
    me[name](...args)
   }
  }
 }
 function focus(input: any) {
  if (input?.['#type'] === 'function') {
   me.state.focus = input.implementation
   return
  }
  me.state.focus = input
 }
 function function_arg(...args: any[]) {
  const implementation = args.pop()
  if (typeof implementation !== 'function') {
   throw new Error(
    'expecting a function at runtime'
   )
  }
  me.state.args.push(implementation)
 }
 function focus_arg() {
  me.state.args.push(me.state.focus)
 }
 function focus_function(...args: any[]) {
  const implementation = args.pop()
  const return_type = args.pop()
  if (typeof implementation !== 'function') {
   throw new Error(
    'expecting a function at runtime'
   )
  }
  me.state.focus = implementation
 }
 function get(...path: string[]) {
  let output = scope
  for (const segment of path) {
   const current = output
   if (
    typeof current === 'undefined' ||
    current === null
   ) {
    throw new Error(
     `cannot get ${JSON.stringify(
      segment
     )} of ${current} in path ${JSON.stringify(
      path
     )}`
    )
   }
   output = current[segment]
   if (typeof output === 'function') {
    output = output.bind(current)
   }
  }
  me.state.focus = output
 }
 function set(...path: string[]) {
  civil_set_property(
   scope,
   path,
   me.state.focus
  )
 }
 const me = {
  args,
  call,
  exists,
  focus_arg,
  focus_function,
  focus,
  function_arg,
  get,
  scope,
  set,
  state,
 }
 return me
}
