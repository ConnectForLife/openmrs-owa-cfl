document.addEventListener('DOMContentLoaded', function (event) {});

typeof $ === 'function' &&
  $(function () {
    const CFL_UI_ROOT = '/openmrs/owa/cfl-ui/';
    /** General **/
    // OpenMRS bug: remove occasional (/undefined) from the System Administration breadcrumbs
    setTimeout(function () {
      elementReady('#breadcrumbs li:last-child:not(:empty)').then(element => {
        element.textContent = element.textContent.replace('(/undefined)', '');
      });
    }, 100);
    /** Home **/
    // add missing breadcrumb for the Homepage
    const breadcrumbs = $('#breadcrumbs');
    if (breadcrumbs.is(':empty')) {
      $('#breadcrumbs').append('<span>Home</span>');
    }
    // add heading for the Home/System Administration dashboard
    const dashboard = $('#body-wrapper > #content');
    if (!!dashboard.has('.row > #apps').length) {
      dashboard.prepend('<div class="homepage-heading">Home</div>');
    } else if (!!dashboard.has('#tasks.row').length) {
      dashboard.prepend('<div class="homepage-heading">System Administration</div>');
    }
    /** Patient Dashboard **/
    // move all the widgets to the first column
    const firstInfoContainer = $('.info-container:first-of-type');
    if (!firstInfoContainer.is(':empty')) {
      const remainingContainersChildren = $('.info-container .info-section');
      remainingContainersChildren.detach().appendTo(firstInfoContainer);
    }
    // re-design Patient header
    const patientHeader = $('.patient-header');
    if (!patientHeader.is(':empty')) {
      const patientId = patientHeader.find('.identifiers:nth-of-type(2) > span').text().trim();
      const patientLocation = patientHeader.find('.patientLocation:not(:empty) > span').text().trim();
      const givenName = patientHeader.find('.PersonName-givenName').text();
      const middleName = patientHeader.find('.PersonName-middleName').text();
      const familyName = patientHeader.find('.PersonName-familyName').text();
      const fullName = [givenName, middleName, familyName].join(' ').replace('  ', ' ');
      const gender = patientHeader.find('.gender-age:first-of-type > span:nth-child(1)').text().trim();
      const age = patientHeader.find('.gender-age:first-of-type > span:nth-child(2)').text().trim();
      const telephoneNumber = patientHeader.find('.gender-age:nth-of-type(2) > span:nth-child(2)').text().trim();
      const personStatus = patientHeader.find('.person-status').detach();
      const personStatusDialog = patientHeader.find('#person-status-update-dialog').detach();
      // construct a new header
      const ageAndGender = ' (' + age.split(' ')[0] + '/' + gender[0] + ')';
      // extract the status out of status: <status>
      const status = personStatus.text().split(':');
      if (status.length > 1) {
        personStatus.text(status[1]);
      }
      var htmlLines = [
        '<div class="patient-header">',
        '<div class="patient-data"><h1>' + fullName + ageAndGender + '</h1>',
        (!!patientId
          ? '<div class="patient-id"><span class="label">Patient ID: </span><span class="value">' + patientId + '</span></div>'
          : '') +
          '<div class="patient-location"><span class="label">Patient Location: </span><span class="value">' +
          patientLocation +
          '</span></div>' +
          '<div class="phone-number"><span class="label">Phone number: </span><span class="value">' +
          telephoneNumber +
          '</span></div>' +
          '<div class="patient-status"><span class="label">Status: </span><span class="value">' +
          personStatus.text() +
          '</span></div>' +
          '</div>' +
          '<div class="header-buttons">'
      ];
      // add buttons on the right side of patient header
      const note = $('.note.warning');
      if (!note.is(':empty')) {
        const buttons = patientHeader.find('.header-buttons');
        const link = note.find('a');
        if (link.length) {
          const href = link.attr('href');
          htmlLines = htmlLines.concat([
            '<button class="btn btn-secondary" onclick="location.href=\'' + href + '\'">',
            link.text().replace('See the', ''),
            '</button>'
          ]);
        }
        const deletePatient = $('#org\\.openmrs\\.module\\.coreapps\\.deletePatient');
        if (deletePatient.length) {
          const href = deletePatient.attr('href');
          htmlLines = htmlLines.concat(['<button class="btn btn-secondary" onclick="' + href + '">', deletePatient.text(), '</button>']);
        }
        const deleteCaregiver = $('#cfl\\.personDashboard\\.deletePerson');
        if (deleteCaregiver.length) {
          const href = deleteCaregiver.attr('href');
          htmlLines = htmlLines.concat(['<button class="btn btn-secondary" onclick="' + href + '">', deleteCaregiver.text(), '</button>']);
        }
        note.remove();
        if (personStatusDialog.length && personStatus.length) {
          htmlLines = htmlLines.concat([
            personStatusDialog[0].outerHTML,
            '<button class="btn btn-secondary" onclick="' +
              personStatus[0].getAttribute('onclick') +
              '">' +
              'Update the status' +
              '</button>'
          ]);
        }
      }
      htmlLines.push('</div></div>');
      patientHeader.replaceWith(htmlLines.join('\n'));

      // add (age/gender) to the breadcrumb
      elementReady('#breadcrumbs li:last-child:not(:empty)').then(element => {
        element.textContent = element.textContent.replace(fullName, fullName + ageAndGender);
      });

      // replace the url of 'Patient profile'
      const patientProfileAnchor = $('a#cfl\\.patientProfile');
      if (!patientProfileAnchor.is(':empty')) {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.has('patientId')) {
          patientProfileAnchor.prop(
            'href',
            `${CFL_UI_ROOT}index.html#/edit-patient/${searchParams.get('patientId')}?redirect=${window.location.href}&name=${fullName}`
          );
        }
      }
    }
    // replace 'None' with '-NO DATA-' in each widget
    $('.info-body').each(function (index) {
      const text = $(this).find('li').text().trim() || $(this).find('p').text().trim() || $(this).text().trim();
      if (text === 'None' || text === 'Unknown' || text.length === 0) {
        $(this).replaceWith("<div class='info-body empty'><span class='label'>-NO DATA-</span></div>");
      }
    });
  });

// MIT Licensed
// Author: jwilson8767

/**
 * Waits for an element satisfying selector to exist, then resolves promise with the element.
 * Useful for resolving race conditions.
 *
 * @param selector
 * @returns {Promise}
 */
function elementReady(selector) {
  return new Promise((resolve, reject) => {
    let el = document.querySelector(selector);
    if (el) {
      resolve(el);
    }
    new MutationObserver((mutationRecords, observer) => {
      // Query for elements matching the specified selector
      Array.from(document.querySelectorAll(selector)).forEach(element => {
        resolve(element);
        //Once we have resolved we don't need the observer anymore.
        observer.disconnect();
      });
    }).observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  });
}
