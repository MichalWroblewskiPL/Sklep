import { render, screen } from "@testing-library/react";
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

describe("Login page", () => {
  test("renderuje formularz logowania", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText("Logowanie")).toBeInTheDocument();
    expect(screen.getByLabelText("Adres e-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Hasło")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /zaloguj się/i })
    ).toBeInTheDocument();
  });
});
