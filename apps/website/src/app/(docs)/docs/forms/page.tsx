import { CodeBlock } from '../../_components/code-block'
import { ComponentPreview } from '../../_components/component-preview'
import { DocsPage, docsMetadata } from '../../_components/docs-page'
import { A, C, Callout, H2, H3, Li, P, Ul } from '../../_components/prose'
import { AutoSubmitDemo } from '../../_demos/auto-submit'
import { ControlledDemo } from '../../_demos/controlled'
import { DisabledDemo } from '../../_demos/disabled'
import { InvalidDemo } from '../../_demos/invalid'

const HREF = '/docs/forms'
export const metadata = docsMetadata(HREF)

const UNCONTROLLED = `// The component keeps its own value; the form reads it by name.
<form action={verifyCode}>
  <OTPInput name="code" maxLength={6} required />
  <button type="submit">Verify</button>
</form>`

const SERVER_ACTION = `'use server'

export async function verifyCode(formData: FormData) {
  const code = formData.get('code') // "123456"
  // …
}`

const REQUEST_SUBMIT = `<OTPInput
  maxLength={6}
  onComplete={() => formRef.current?.requestSubmit()}
/>`

const FOCUS_BUTTON = `<OTPInput
  maxLength={6}
  // Hand the user the button instead of submitting for them.
  onComplete={() => submitRef.current?.focus()}
/>`

const RHF_REGISTER = `import { useForm } from 'react-hook-form'

const { register, handleSubmit } = useForm<{ code: string }>()
const field = register('code', { minLength: 6, required: true })

<form onSubmit={handleSubmit(onValid)}>
  <OTPInput
    {...field}
    maxLength={6}
    // register() types onChange for events, but input-otp hands it a
    // string — wrap the string in the event shape react-hook-form reads
    onChange={value => field.onChange({ target: { name: 'code', value } })}
  />
</form>`

const RHF_CONTROLLER = `import { Controller, useForm } from 'react-hook-form'

const { control, handleSubmit } = useForm({ defaultValues: { code: '' } })

<Controller
  name="code"
  control={control}
  rules={{ minLength: 6 }}
  render={({ field }) => (
    <OTPInput
      // onChange gives you a string, which is exactly what field.onChange wants
      {...field}
      maxLength={6}
      // handleSubmit(onValid) expects a form event, not the code — wrap it
      onComplete={() => handleSubmit(onValid)()}
    />
  )}
/>`

const RESET_AFTER_FAILURE = `const [value, setValue] = React.useState('')
const inputRef = React.useRef<HTMLInputElement>(null)

async function check(code: string) {
  if (await isWrong(code)) {
    setError('That code is incorrect.')
    setValue('')                   // clear it
    inputRef.current?.focus()      // and put them back at slot 0
  }
}`

const PENDING = `const { pending } = useFormStatus()

<OTPInput
  maxLength={6}
  disabled={pending}
  containerClassName="group flex has-[:disabled]:opacity-50"
/>`

export default function FormsPage() {
  return (
    <DocsPage href={HREF}>
      <P>
        The field is a real <C>&lt;input&gt;</C> with a <C>name</C> and a value,
        so it behaves like one everywhere: in a plain HTML form, in a server
        action, in react-hook-form, in whatever you already use. Nothing here is
        input-otp-specific except <C>onComplete</C>.
      </P>

      <H2>Controlled or not</H2>
      <P>
        Omit <C>value</C> and the component keeps its own state — seeded from{' '}
        <C>defaultValue</C>, readable by the form through <C>name</C>. That is
        the right default; reach for control only when something else needs to
        read or write the value mid-flight.
      </P>
      <CodeBlock code={UNCONTROLLED} />
      <CodeBlock code={SERVER_ACTION} lang="ts" />
      <P>
        Passing <C>value</C> makes it controlled. Note that <C>onChange</C>{' '}
        hands you a <em>string</em>, not an event, so a <C>useState</C> setter
        drops straight in:
      </P>
      <ComponentPreview name="controlled">
        <ControlledDemo />
      </ComponentPreview>
      <Callout
        type="note"
        title="Values you set are still validated by the browser"
      >
        <p>
          The value you pass is written to a real input with a real{' '}
          <C>maxLength</C>. Anything longer is truncated on the way in, and your{' '}
          <C>pattern</C> is <em>not</em> applied to programmatic values — only
          to user input. Sanitise before you set state if that matters.
        </p>
      </Callout>

      <H2>Submitting on completion</H2>
      <P>
        Nobody wants to press a button after typing the last digit of a code
        they just read off a phone. <C>onComplete</C> fires once, on the
        transition into a full value — from typing, from a paste, or from an SMS
        autofill that drops all six characters at once.
      </P>
      <ComponentPreview name="auto-submit">
        <AutoSubmitDemo />
      </ComponentPreview>
      <CodeBlock code={REQUEST_SUBMIT} />
      <Callout type="tip" title="requestSubmit, not submit">
        <p>
          <C>form.submit()</C> bypasses validation and never fires a{' '}
          <C>submit</C> event, so React&apos;s <C>onSubmit</C> and any server
          action wired to the form are skipped entirely.{' '}
          <C>form.requestSubmit()</C> behaves like a real button press.
        </p>
      </Callout>
      <P>
        If auto-submitting feels too eager — a slow request, a destructive
        action, a code the user might want to double-check — move focus instead
        and let them confirm:
      </P>
      <CodeBlock code={FOCUS_BUTTON} />

      <H3>While the request is in flight</H3>
      <P>
        Disable the field so a second <C>onComplete</C> can&apos;t fire
        mid-request, and so the user isn&apos;t editing a code that&apos;s
        already being checked:
      </P>
      <CodeBlock code={PENDING} />

      <H2>Errors</H2>
      <P>
        A wrong code is not a validation error in the HTML sense — the input is
        perfectly well-formed, the server just disagrees with it. So you own the
        state, and you own the announcement:
      </P>
      <ComponentPreview name="invalid">
        <InvalidDemo />
      </ComponentPreview>
      <Ul>
        <Li>
          <C>aria-invalid</C> on the field, and <C>aria-describedby</C> pointing
          at the message.
        </Li>
        <Li>
          <C>role=&quot;alert&quot;</C> on the message so it is read when it
          appears.
        </Li>
        <Li>
          Clear the error in <C>onChange</C>. An error that persists while the
          user is visibly fixing it reads as broken.
        </Li>
        <Li>
          Keep the shake small, and behind <C>motion-safe:</C>.
        </Li>
      </Ul>
      <P>
        If your flow starts over on failure, clear the value and take focus back
        to the first slot — <C>ref</C> points at the real input, so this is
        ordinary DOM:
      </P>
      <CodeBlock code={RESET_AFTER_FAILURE} lang="tsx" />

      <H2>Disabled and read-only</H2>
      <P>
        Both are native, and both are readable from CSS without a prop reaching
        your slots — <C>has-[:disabled]</C> and <C>has-[:read-only]</C> on the
        container.
      </P>
      <ComponentPreview name="disabled">
        <DisabledDemo />
      </ComponentPreview>
      <P>
        Use <C>readOnly</C> when a code should be visible but not editable
        (showing a recovery code back to the user, for instance) — it stays
        focusable and selectable, so it can still be copied.
      </P>

      <H2>react-hook-form</H2>
      <P>
        <C>Controller</C> is the path of least resistance — its{' '}
        <C>field</C> hands you <C>value</C> and an <C>onChange</C> that accepts
        exactly the string input-otp emits, so the spread type-checks as-is:
      </P>
      <CodeBlock code={RHF_CONTROLLER} />
      <P>
        <C>register</C> reaches the real input too (<C>ref</C> is forwarded),
        but its TypeScript types say <C>onChange</C> takes an event while
        input-otp calls it with a string. react-hook-form unwraps plain values
        at runtime, so only the compiler objects — spread <C>register</C>{' '}
        as-is and strict TypeScript rejects the <C>onChange</C> collision. A
        one-line adapter satisfies it:
      </P>
      <CodeBlock code={RHF_REGISTER} />

      <H2>Labelling</H2>
      <P>
        One input means one <C>&lt;label&gt;</C>. See{' '}
        <A href="/docs/accessibility">Accessibility</A> — it is a short page and
        it matters more than most of this one.
      </P>
    </DocsPage>
  )
}
