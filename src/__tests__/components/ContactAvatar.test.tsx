import React from "react";
import { render, screen } from "@testing-library/react";
import ContactAvatar from "@/components/contacts/ContactAvatar";
import { makeContact } from "../mocks/handlers";

describe("ContactAvatar", () => {
  it("renders the contact photo when one is set", () => {
    const photoUrl = "https://example.com/ada.jpg";
    const { container } = render(
      <ContactAvatar contact={makeContact({ photo_url: photoUrl })} />,
    );

    expect(container.querySelector("img")).toHaveAttribute("src", photoUrl);
  });

  it("renders initials when the contact has no photo", () => {
    render(<ContactAvatar contact={makeContact({ photo_url: null })} />);

    expect(screen.getByText("AL")).toBeInTheDocument();
  });
});
