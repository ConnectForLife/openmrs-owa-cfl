/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 * <p>
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import React, { useEffect, useRef } from 'react';
import ValidationError from './ValidationError';
import cx from 'classnames';
import { connect } from 'react-redux';
import { injectIntl, IntlShape } from 'react-intl';
import { Input as ReactstrapInput } from 'reactstrap';
import { IFieldProps } from './Field';
import { getCommonInputProps, getPlaceholder } from '../../../shared/util/patient-form-util';
import { IConceptState } from '../../../shared/models/concept';
import { CONCEPT, GLOBAL_PROPERTY } from '../../../shared/constants/concept';
import { INPUT_COUNTRY_NAME } from '../../../shared/constants/input';

export interface ISelectProps extends StateProps, DispatchProps, IFieldProps {
  intl: IntlShape;
}

interface IStore {
  concept: IConceptState;
  settings: {
    settings: [{ property: string, value: string }],
    setting: { value: string }
  };
}

export const Select = (props: ISelectProps) => {
  const {
    inputRef,
    field,
    isInvalid,
    isDirty,
    className,
    value,
    patient,
    intl,
    selectOptions,
    concept,
    onPatientChange,
    settings,
    onFirstInputKeyDown,
    onLastInputKeyDown
  } = props;
  const { name, required, label, options, defaultOption = '', optionSource = '', optionUuid = '', optionKey = '' } = field;
  const hasValue = value || patient[name] || defaultOption;
  const placeholder = getPlaceholder(intl, label, name, required);
  const commonProps = getCommonInputProps(props, placeholder);
  const dataTestId = props['data-testid'] || name;
  const isConceptOptionSource = optionSource === CONCEPT;
  const isGlobalPropertyOptionSource = optionSource === GLOBAL_PROPERTY;
  const innerRef = useRef(null);

  useEffect(() => {
    inputRef && inputRef(innerRef.current);
  }, []);

  useEffect(() => {
    if (!patient[name] && defaultOption) {
      onPatientChange({ ...patient, [name]: defaultOption });
    }
  }, [defaultOption, name, onPatientChange, patient]);

  const getSelectOptions = () => {
    const foundGlobalProperty = settings?.settings.find(({ property }) => property === optionUuid);
    const foundConcept = concept?.concepts.find(({ uuid }) => uuid === optionUuid);
    let opts = selectOptions || options;

    if (isGlobalPropertyOptionSource && foundGlobalProperty?.value) {
      const configParsed = JSON.parse(foundGlobalProperty.value);
      if (name === INPUT_COUNTRY_NAME) {
        opts = Object.keys(configParsed[optionKey]);
      } else {
        opts = configParsed[optionKey].map(mappedConfig => mappedConfig.name);
      }
    } else if (isConceptOptionSource && foundConcept?.setMembers.length) {
      opts = foundConcept.setMembers.map(({ display }) => display).sort();
    } else {
      // Do nothing
    }

    if (opts) {
      return (
        <>
          {
            <option value="" disabled hidden>
              {placeholder}
            </option>
          }
          {opts.map(option => (
            <option value={option.value || option} key={`option-${option.value || option}`}>
              {option.label || option}
            </option>
          ))}
        </>
      );
    }
  };

  return (
    <div className={`${className} input-container`}>
      <ReactstrapInput
        innerRef={innerRef}
        {...commonProps}
        onKeyDown={e => {
          !!onFirstInputKeyDown && onFirstInputKeyDown(e);
          if (!e.defaultPrevented) {
            !!onLastInputKeyDown && onLastInputKeyDown(e);
          }
        }}
        className={cx('form-control', {
          invalid: isDirty && isInvalid,
          placeholder: !hasValue
        })}
        type="select"
        data-testid={dataTestId}
        defaultValue={defaultOption}
      >
        {getSelectOptions()}
      </ReactstrapInput>
      {hasValue && <span className="placeholder">{placeholder ? intl.formatMessage({ id: `${placeholder}` }) : ''}</span>}
      {isDirty && isInvalid && <ValidationError hasValue={hasValue} field={field} />}
    </div>
  );
};

const mapStateToProps = ({ concept, settings }: IStore) => ({ concept, settings });

const mapDispatchToProps = {};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Select));
