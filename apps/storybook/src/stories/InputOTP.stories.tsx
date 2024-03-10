import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"

const meta = {
  title: "ui/InputOTP",
  component: InputOTP,
  tags: ["autodocs"],
  argTypes: {},
  args: {
    maxLength: 6,
    pattern: REGEXP_ONLY_DIGITS_AND_CHARS,
    render: ({ slots }) => (
      <InputOTPGroup>
        {slots.map((slot, index) => (
          <InputOTPSlot key={index} {...slot} />
        ))}
      </InputOTPGroup>
    ),
  },
  parameters: {
    layout: "centered",
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}