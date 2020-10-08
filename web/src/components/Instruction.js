import PropTypes from 'prop-types';
import React from 'react';

import Md from './Md';
import { t } from '../i18n';

const Heading = ({ level, className, labelFor, children }) => {
  const Tag = level;
  const component = (
    <Tag className={className}>
      {children}
    </Tag>
  );

  if (!labelFor) {
    return component;
  } else {
    return <label htmlFor={labelFor}>{component}</label>
  }
}

const Instruction = ({ args, reverse, source, headingDisplay, labelFor }) => {
  const heading = t([source, 'heading'], { defaultValue: false, ...args });
  const short = t([source, 'short'], { defaultValue: false, ...args });
  const detail = t([source, 'detail'], { defaultValue: false, ...args });
  const list = t([source, 'list'], { defaultValue: false, ...args });
  const helpText = t([source, 'helpText'], { defaultValue: false, ...args });
  const Tag = headingDisplay.level;

  if (heading || short || detail || helpText) {
    return (
      <div>
        {heading && (
          <Heading {...headingDisplay} labelFor={labelFor}>
            {heading}
          </Heading>
        )}
        {(short || detail || list || helpText) && (
          <div className="visibility--screen">
            {reverse && detail && <Md content={detail} wrapper="p" />}
            {short && <p className="ds-u-font-weight--bold">{short}</p>}
            {!reverse && detail && <Md content={detail} wrapper="p" />}
            {list && (
              <ol className="ds-u-margin-bottom--4 ds-u-padding-left--2">
                {/* eslint-disable-next-line react/no-array-index-key */}
                {list.map((item, i) => <li className="ds-u-margin-bottom--2" key={i}>{item}</li>)}
              </ol>
            )}
            {helpText && (
              <Md content={helpText} wrapper="p" className="instruction-box" />
            )}
          </div>
        )}
      </div>
    );
  }
  return null;
};

Instruction.propTypes = {
  args: PropTypes.object,
  reverse: PropTypes.bool,
  source: PropTypes.string.isRequired,
  headingDisplay: PropTypes.object,
  labelFor: PropTypes.string
};

Instruction.defaultProps = {
  args: null,
  reverse: false,
  headingDisplay: {
    level: 'h3',
    className: 'ds-h3'
  }
};

export default Instruction;
