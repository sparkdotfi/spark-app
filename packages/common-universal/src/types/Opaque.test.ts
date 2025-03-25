import { Opaque } from './Opaque.js'

type TestType = Opaque<string, 'TestType'>
type AnotherTestType = AnotherOpaque<string, 'TestType'>
type DifferentTestType = Opaque<string, 'DifferentTestType'>

describe.skip('[Type-Level] Opaque type helper', () => {
  it('allows to pass opaque type as base type', () => {
    const v1: TestType = 'test' as any

    const _v2: string = v1
  })

  it('does not allow to pass base type as opaque type', () => {
    const v1: number = 1

    // @ts-expect-error
    const _v2: TestType = v1
  })

  it('allows to pass different instances of the same opaque type', () => {
    const v1: TestType = 'test' as any
    let _v2: AnotherTestType = 'test' as any

    _v2 = v1
  })

  it('does not allow to mix opaque types', () => {
    const v1: TestType = 'test' as any
    let _v2: DifferentTestType = 'test' as any

    // @ts-expect-error
    _v2 = v1
  })
})

// we copy-pasted opaque type helper again to simulate Opaque type created from another instance of the same package (@sparkdotfi/common-universal)
type StringLiteral<Type> = Type extends string ? (string extends Type ? never : Type) : never
type WithOpaque<Token extends string> = {
  readonly __TAG__: Token
}
type AnotherOpaque<Type, Token extends string> = Token extends StringLiteral<Token> ? Type & WithOpaque<Token> : never
