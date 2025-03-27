import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sell from "./Sell";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

jest.mock("../AuthService", () => ({
  authService: {
    getListing: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteListing: jest.fn(),
  },
}));

jest.mock("react-modal", () => {
  const Modal = jest.requireActual("react-modal");
  Modal.setAppElement = jest.fn();
  return {
    __esModule: true,
    default: Modal,
  };
});

jest.mock("react-slick", () => ({
  ...jest.requireActual("react-slick"),
}));

global.URL.createObjectURL = jest.fn();

describe("Sell Component", () => {
  test("renders Sell component", () => {
    render(
      <MemoryRouter>
        <Sell />
      </MemoryRouter>
    );
    expect(screen.getByText("My Listings")).toBeInTheDocument();
  });

  test("Renders product form", async () => {
    render(
      <MemoryRouter>
        <Sell />
      </MemoryRouter>
    );

    const button = screen.getByTestId("add-listing-btn");
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByText("Create New Listing")).toBeInTheDocument();
  });


test("Test product form", async () => {
  render(
    <MemoryRouter>
      <Sell />
    </MemoryRouter>
  );
  const button = screen.getByTestId("add-listing-btn");
  fireEvent.click(button);
  const productNameInput = screen.getByLabelText(/Product Name/i);
  expect(productNameInput).toBeInTheDocument();
  const DescriptionInput = screen.getByLabelText(/Description/i);
  expect(DescriptionInput).toBeInTheDocument();
  const price = screen.getByLabelText(/price/i);
  expect(price).toBeInTheDocument();
  const Category = screen.getByLabelText(/Category/i);
  expect(Category).toBeInTheDocument();
  const UploadImages = screen.getByLabelText(/Upload Images/i);
  expect(UploadImages).toBeInTheDocument();

  fireEvent.change(productNameInput, { target: { value: 'Product A' } });
  fireEvent.change(DescriptionInput, { target: { value: 'This is a great product.' } });
  fireEvent.change(price, { target: { value: '19.99' } });
  fireEvent.change(Category, { target: { value: 'Electronics' } });
  expect(UploadImages).toBeInTheDocument();

  const fileInput = screen.getByLabelText(/upload images/i) as HTMLInputElement;

    // Simulate file selection (Mock the file list)
    const file = new File(['image content'], 'image.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Assert that the file input received the file
    if (fileInput.files) {
      expect(fileInput.files[0]).toBe(file);
      expect(fileInput.files).toHaveLength(1);
    }

    // Check if the preview images are shown
    const imagePreview = screen.getByAltText(/Preview 0/);
    expect(imagePreview).toBeInTheDocument();

    // Submit the form
    const submitButton = screen.getByText(/List Item/i);
    expect(submitButton).toBeInTheDocument();
    fireEvent.click(submitButton);
});


test("Test product form cancle button", async () => {
  render(
    <MemoryRouter>
      <Sell />
    </MemoryRouter>
  );
  const button = screen.getByTestId("add-listing-btn");
  fireEvent.click(button);

  const cancelButton = screen.getByText(/Cancel/i);
    expect(cancelButton).toBeInTheDocument();
    fireEvent.click(cancelButton);
}
);
});