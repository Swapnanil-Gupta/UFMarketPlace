import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => jest.fn(),
  }));

  jest.mock("./AuthService", () => ({
    authService: {
        getListingsByOtheruser: jest.fn().mockResolvedValue([
            {
              id: '1',
              productName: 'Product A',
              productDescription: 'Description A',
              price: '10',
              category: 'Category A',
              images: [{ contentType: 'image/jpeg', data: 'base64encodedstring' }],
              userName: 'User A',
              userEmail: 'usera@example.com'
            },
            {
              id: '2',
              productName: 'Product B',
              productDescription: 'Description B',
              price: '20',
              category: 'Category B',
              images: [{ contentType: 'image/jpeg', data: 'base64encodedstring' }],
              userName: 'User B',
              userEmail: 'userb@example.com'
            }
          ]),
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

    describe("Dashboard Component", () => {
        test("renders Dashboard page", async () => {
            render(
                <MemoryRouter>
                    <Dashboard />
                </MemoryRouter>
            );
            //expect(screen.getByText("Dashboard")).toBeInTheDocument();
            //expect(screen.getByText("UF Marketplace")).toBeInTheDocument();
            expect(screen.getByText("Sell")).toBeInTheDocument();
            // Wait for the products to be fetched and rendered
            await waitFor(() => {
                expect(screen.getByText("Product A")).toBeInTheDocument();
                expect(screen.getByText("Product B")).toBeInTheDocument();
      });
    });
    test("opens and closes modal with product details", async () => {
        render(
          <MemoryRouter>
            <Dashboard />
          </MemoryRouter>
        );
    
        // Wait for the products to be fetched and rendered
        await waitFor(() => {
          expect(screen.getByText("Product A")).toBeInTheDocument();
          expect(screen.getByText("Product B")).toBeInTheDocument();
        });
    
        // Click on the first product to open the modal
        fireEvent.click(screen.getByText("Product A"));
    
        // Check if the modal is opened with the correct product details
        await waitFor(() => {
          expect(screen.getByText("Description A")).toBeInTheDocument();
          //expect(screen.getByText("10$", { selector: '.price' })).toBeInTheDocument();
          //expect(screen.getByText("Category A")).toBeInTheDocument();
          expect(screen.getByText("User A")).toBeInTheDocument();
          expect(screen.getByText("usera@example.com")).toBeInTheDocument();
        });
    
        // Close the modal
        fireEvent.click(screen.getByRole("button", { name: /×/i }));

        // Check if the modal is closed
        await waitFor(() => {
          expect(screen.queryByText("Description A")).not.toBeInTheDocument();
        });
      });
    });





  