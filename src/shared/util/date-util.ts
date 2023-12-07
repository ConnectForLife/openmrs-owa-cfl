/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 * <p>
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

export const dobToAge = dob => {
  if (!dob) return dob;
  const birthDate = new Date(dob);
  const difference = Date.now() - birthDate.getTime();
  const age = new Date(difference);

  return Math.abs(age.getUTCFullYear() - 1970);
};

export const DATE_FORMAT = 'dd MMM yyyy';

export const formatDate = (intl, date) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);

export const isoDateString = jsDate => (jsDate ? jsDate.toISOString().split('T')[0] : null);

export const MILLIS_PER_MINUTE = 60 * 1000;

export const WEEK_DAYS_KEYS = [
  'cfl.weekDay.Sunday.shortName',
  'cfl.weekDay.Monday.shortName',
  'cfl.weekDay.Tuesday.shortName',
  'cfl.weekDay.Wednesday.shortName',
  'cfl.weekDay.Thursday.shortName',
  'cfl.weekDay.Friday.shortName',
  'cfl.weekDay.Saturday.shortName'
];
export const MONTH_NAMES_KEYS = [
  'cfl.month.January.fullName',
  'cfl.month.February.fullName',
  'cfl.month.March.fullName',
  'cfl.month.April.fullName',
  'cfl.month.May.fullName',
  'cfl.month.June.fullName',
  'cfl.month.July.fullName',
  'cfl.month.August.fullName',
  'cfl.month.September.fullName',
  'cfl.month.October.fullName',
  'cfl.month.November.fullName',
  'cfl.month.December.fullName'
];