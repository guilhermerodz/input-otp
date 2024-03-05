'use server'

export async function formAction(formData: FormData) {
  const rawFormData = {
    otp: formData.get('otp'),
  }

  console.log({ rawFormData })
}
