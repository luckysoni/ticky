import { faArrowsAlt, faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode } from "react";
import { Flex } from "../flex";
import './wrapper.css'

export function Wrapper({ children }: { children: ReactNode }) {
  return (
    <div className="App">
      <div className="DragAnchor">
        <Flex alignItems="center">
          <FontAwesomeIcon icon={faClock} className="AppIcon" /> Time Keeper
        </Flex>
        <FontAwesomeIcon icon={faArrowsAlt} />
      </div>
      {children}
    </div>
  );
}
