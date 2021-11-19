export const testDefaultKeyStatePersonnel = () => {
  beforeEach(() => {
    cy.goToKeyStatePersonnel();
    cy.url().should('contain', '/state-profile');
  });
  it('should have the default State Director/Office', () => {
    cy.get('input[name="apd-state-profile-mdname"]')
      .clear()
      .should('have.text', '');
    cy.waitForSave();
    cy.get('input[name="apd-state-profile-mdemail"]')
      .clear()
      .should('have.text', '');
    cy.waitForSave();
    cy.get('input[name="apd-state-profile-mdphone"]')
      .clear()
      .should('have.text', '');
    cy.waitForSave();
    cy.get('input[name="apd-state-profile-addr1"]')
      .clear()
      .should('have.text', '');
    cy.waitForSave();
    cy.get('input[name="apd-state-profile-addr2"]')
      .clear()
      .should('have.text', '');
    cy.waitForSave();
    cy.get('input[name="apd-state-profile-city"]')
      .clear()
      .should('have.text', '');
    cy.waitForSave();
    cy.get('input[name="apd-state-profile-zip"]')
      .clear()
      .should('have.text', '');
    cy.waitForSave();
    cy.get('select[name="apd-state-profile-state"]')
      .invoke('val', '')
      .trigger('change');
    cy.waitForSave();
  });

  it('State dropdown has 56 states & territories', () => {
    cy.get('#apd-state-profile-state>option').should('have.length', 56);
  });

  it('Verify no primary contacts message', () => {
    cy.contains(
      'Primary Point of Contact has not been added for this activity'
    ).should('exist');
  });
};

export const testDefaultKeyStatePersonnelExportView = () => {
  beforeEach(() => {
    // Get div with personnel data
    cy.findByRole('heading', { name: /Key State Personnel/i })
      .parent()
      .as('personnel');
  });

  it('Medicaid director has default/blank values', () => {
    cy.get('@personnel')
      .findByRole('heading', { name: /Medicaid director/i })
      .next()
      .should('have.text', 'Name:  Email: Phone: '); // Name has a mysterious extra space...
  });

  it('No response for Medicaid office address', () => {
    cy.get('@personnel')
      .findByRole('heading', { name: /Medicaid office address/i })
      .next()
      .should('have.text', 'No response was provided');
  });
};

export const testKeyStatePersonnelWithData = years => {
  beforeEach(() => {
    cy.goToKeyStatePersonnel();
  });

  it('Fill out Key State Personnel', () => {
    cy.url().should('include', '/state-profile');
    cy.findByRole('heading', { name: /Key State Personnel/i }).should('exist');

    cy.log('State Director and Office Address');
    cy.fixture('users').then(userData => {
      cy.get('input[name="apd-state-profile-mdname"]')
        .clear()
        .type(userData[0].name);
      cy.waitForSave();
      cy.get('input[name="apd-state-profile-mdemail"]')
        .clear()
        .type(userData[0].email);
      cy.waitForSave();
      cy.get('input[name="apd-state-profile-mdphone"]')
        .clear()
        .type(userData[0].phone);
      cy.waitForSave();
      cy.get('input[name="apd-state-profile-addr1"]')
        .clear()
        .type(userData[0].address.street);
      cy.waitForSave();
      cy.get('input[name="apd-state-profile-addr2"]')
        .clear()
        .type(userData[0].address.suite);
      cy.waitForSave();
      cy.get('input[name="apd-state-profile-city"]')
        .clear()
        .type(userData[0].address.city);
      cy.waitForSave();
      cy.get('input[name="apd-state-profile-zip"]')
        .clear()
        .type(userData[0].address.zipcode);
      cy.waitForSave();
      cy.get('select[name="apd-state-profile-state"]')
        .invoke('val', 'AL')
        .trigger('change');
      cy.waitForSave();

      cy.log('Primary Point of Contact');
      cy.findByRole('button', { name: /Add Primary Contact/i }).click();
      cy.waitForSave();
      cy.get('input[name="apd-state-profile-pocname0"]')
        .clear()
        .type(userData[1].name);
      cy.waitForSave();
      cy.get('input[name="apd-state-profile-pocemail0"]')
        .clear()
        .type(userData[1].email);
      cy.waitForSave();
      cy.get('input[name="apd-state-profile-pocposition0"]')
        .clear()
        .type(userData[1].username);
      cy.waitForSave();
      cy.findByRole('button', { name: /Done/i }).click();

      cy.log('Key Personnel');
      cy.findByRole('button', { name: /Add Key Personnel/i }).click();
      cy.waitForSave();
      cy.get('.ds-c-review__heading')
        .contains('1.')
        .should('have.text', `1. ${userData[1].name}`);
      cy.get('.ds-c-review__heading')
        .contains('1.')
        .next()
        .find('li')
        .should($lis => {
          expect($lis.eq(0)).to.contain('Primary APD Point of Contact');
          expect($lis.eq(1)).to.contain(userData[1].username);
        });
      cy.findByRole('button', { name: /Done/i }).click();

      cy.log('Key Personnel (hourly)');
      cy.findByRole('button', { name: /Add Key Personnel/i }).click();
      cy.waitForSave();
      // Toggle to see if the FFY cost prompts appear/disappear
      cy.get('input[type="radio"][value="no"]').check({ force: true });
      cy.waitForSave();
      years.forEach(year => {
        cy.contains(`FFY ${year} Cost`).should('not.exist');
      });

      cy.get('input[type="radio"][value="yes"]').check({ force: true });
      cy.waitForSave();
      years.forEach(year => {
        cy.contains(`FFY ${year} Cost`).should('exist');
      });
      cy.findByRole('button', { name: /Done/i }).click();
    });
  });

  it('Edit Key Personnel', () => {
    cy.findAllByRole('button', { name: /Delete/i })
      .eq(0)
      .click();
    cy.get('.ds-c-button--danger').click();
    cy.findAllByRole('button', { name: /Edit/i }).should('have.length', 2);

    cy.findAllByRole('button', { name: /Edit/i }).eq(1).click();

    cy.fixture('users').then(userData => {
      cy.get('input[name="apd-state-profile-pocname1"]')
        .clear()
        .type(userData[2].name);
      cy.waitForSave();
      cy.get('input[name="apd-state-profile-pocemail1"]')
        .clear()
        .type(userData[2].email);
      cy.waitForSave();
      cy.get('input[name="apd-state-profile-pocposition1"]')
        .clear()
        .type(userData[2].username);
      cy.waitForSave();

      cy.findByRole('button', { name: /Done/i }).click();
      cy.log('Values entered in form remain on page');

      cy.get('.ds-c-review__heading')
        .contains('2.')
        .should('have.text', `2. ${userData[2].name}`);
      cy.get('.ds-c-review__heading')
        .contains('2.')
        .next()
        .find('li')
        .should($lis => {
          expect($lis.eq(0)).to.contain(userData[2].username);
        });
    });
  });

  it('should display the correct values in the export view', () => {
    cy.goToExportView();

    cy.findByRole('heading', { name: /Key State Personnel/i })
      .parent()
      .as('personnel');

    cy.fixture('users').then(userData => {
      cy.log('Medicaid director');
      cy.get('@personnel')
        .findByRole('heading', { name: /Medicaid director/i })
        .next()
        .should(
          'have.text',
          `Name:  ${
            userData[0].name // Mysterious extra space
          }Email: ${userData[0].email}Phone: ${userData[0].phone}`
        );

      // Default state is Alabama
      cy.log('Medicaid office address');
      cy.get('@personnel')
        .findByRole('heading', { name: /Medicaid office address/i })
        .next()
        .should(
          'have.text',
          `${
            userData[0].address.street +
            userData[0].address.suite +
            userData[0].address.city
          }, AL ${userData[0].address.zipcode}`
        );

      // Check text data for the first personnel
      cy.log('Primary APD Point of Contact');
      cy.get('@personnel')
        .findByRole('heading', {
          name: /Key Personnel and Program Management/i
        })
        .next()
        .find('ul')
        .first()
        .should(
          'have.text',
          `1. ${userData[1].name}Primary APD Point of Contact${userData[1].username}Email: ${userData[1].email}Total cost: $0`
        );

      // Create string to check for personnel who is chargeable for the project for certain years.
      let str = `2. ${userData[2].name}${userData[2].username}Email: ${userData[2].email}`;
      str += years
        .map(year => `FFY ${year} Cost: $0 | FTE: 0 | Total: $0`)
        .join('');

      cy.log('Key Personnel');
      cy.get('@personnel')
        .findByRole('heading', {
          name: /Key Personnel and Program Management/i
        })
        .next()
        .find('ul')
        .eq(1)
        .should('have.text', str);
    });

    cy.findByRole('button', { name: /Back to APD/i }).click({ force: true });
  });
};
