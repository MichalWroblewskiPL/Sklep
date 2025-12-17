import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Login from "../pages/Login";

jest.mock("../firebase", () => ({
  auth: {},
  db: {},
  storage: {},
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
}));

describe("Login form validation", () => {
  test("pokazuje błąd przy niepoprawnym adresie e-mail", async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("Adres e-mail");
    const passwordInput = screen.getByLabelText("Hasło");
    const submitButton = screen.getByRole("button", {
      name: /zaloguj się/i,
    });

    await userEvent.type(emailInput, "zlyemail");
    await userEvent.type(passwordInput, "123456");
    await userEvent.click(submitButton);

    expect(
      await screen.findByText("Podaj poprawny adres e-mail.")
    ).toBeInTheDocument();
  });
});
