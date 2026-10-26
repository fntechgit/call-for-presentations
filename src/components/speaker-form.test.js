/**
 * Copyright 2026 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import { CompanyInput } from 'openstack-uicore-foundation/lib/components';
import SpeakerForm from './speaker-form';

jest.mock('awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css', () => ({}));
jest.mock('i18n-react/dist/i18n-react', () => ({ translate: (key) => key }));
jest.mock('openstack-uicore-foundation/lib/utils/methods', () => ({ findElementPos: () => 0 }));
jest.mock('openstack-uicore-foundation/lib/components', () => {
    const stub = () => null;
    return {
        Input: stub, TextEditor: stub, UploadInput: stub, Exclusive: stub, CountryInput: stub,
        LanguageInput: stub, CheckboxList: stub, FreeMultiTextInput: stub, CompanyInput: () => null,
    };
});
jest.mock('./affiliationstable', () => () => null);
jest.mock('./inputs/presentation-links', () => () => null);
jest.mock('../utils/methods', () => ({ validate: jest.fn(), scrollToError: jest.fn() }));

const findById = (node, id) => {
    if (!node || typeof node !== 'object') return null;
    if (Array.isArray(node)) {
        for (const child of node) {
            const found = findById(child, id);
            if (found) return found;
        }
        return null;
    }
    if (node.props?.id === id) return node;
    return findById(node.props?.children, id);
};

describe('SpeakerForm without a summit', () => {
    it('renders the company field as a global CompanyInput (CFP-PROD-N, /app/profile)', () => {
        // no summit prop: /app/profile renders the form before any summit is selected
        const form = new SpeakerForm({
            entity: { company: 'Acme', other_presentation_links: [] },
            errors: {},
            member: { id: 1 },
            orgRoles: [],
        });

        const company = findById(form.render(), 'company');

        expect(company.type).toBe(CompanyInput);
        expect(company.props).not.toHaveProperty('summitId');
        expect(company.props).not.toHaveProperty('queryFunction');
        expect(company.props.value).toEqual({ id: 0, name: 'Acme' });
    });
});
