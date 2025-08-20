import { Button } from "@chakra-ui/react"
import { render } from "./render"
import { screen } from "@testing-library/react"

test("renders a button", () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText("Click me")).toBeInTheDocument()
})