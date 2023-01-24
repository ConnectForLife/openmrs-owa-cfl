/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 * <p>
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { setValue } from '../../../shared/util/patient-form-util';
import { IFieldProps, IFieldState } from './Field';
import { Buttons as GenericButtons } from '../../common/form/Buttons';

export interface IButtonsProps extends StateProps, DispatchProps, IFieldProps {
  intl: any;
}

class Buttons extends React.Component<IButtonsProps, IFieldState> {
  onChange = value => setValue(this.props.patient, this.props.field.name, this.props.onPatientChange, value);

  render = () => {
    const { intl, field, isInvalid, className, patient, isDirty, onKeyDown } = this.props;
    const { options } = field;
    const hasValue = !!patient[field.name];
    return (
      <div className={`${className}`}>
        <GenericButtons options={options} entity={patient} fieldName={field.name} onChange={this.onChange} onKeyDown={onKeyDown} intl={intl}/>
        {isDirty && isInvalid && (
          <span className="error field-error">
            {intl.formatMessage({
              id: hasValue ? field.errorMessage || `registerPatient.invalid` : `registerPatient.required`
            })}
          </span>
        )}
      </div>
    );
  };
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Buttons));
