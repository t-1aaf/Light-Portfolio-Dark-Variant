import { Fragment, type ElementType } from "react";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** Opt in to the scroll-triggered masked rise (see revealHeadings) */
  reveal?: boolean;
};

/** Splits a string into masked words so each one can rise into place on its own. */
export default function Words({ text, as: Tag = "span", className, reveal = true }: Props) {
  const words = text.split(" ");
  return (
    <Tag className={className} data-reveal={reveal ? "" : undefined}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="sw">
            <span className="sw__i">{word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
