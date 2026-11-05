/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SentryFallbackFunction } from './SentryErrorComponent';

jest.mock('i18n-react/dist/i18n-react', () => ({ translate: jest.fn((key) => key) }));

const chunkError = () => {
    const error = new Error('Loading chunk 123 failed.');
    error.name = 'ChunkLoadError';
    return error;
};

describe('SentryFallbackFunction', () => {
    const onReload = jest.fn();
    const Fallback = SentryFallbackFunction({ componentName: 'Call For Presentation App', onReload });

    beforeEach(() => jest.clearAllMocks());

    it('offers a reload when a lazy route chunk fails to load', () => {
        render(<Fallback error={chunkError()} />);
        fireEvent.click(screen.getByRole('button', { name: 'errors.reload_page' }));

        expect(screen.getByText(/errors.chunk_load_error/)).toBeTruthy();
        expect(onReload).toHaveBeenCalledTimes(1);
    });

    it('keeps the generic message for any other error', () => {
        render(<Fallback error={new TypeError('boom')} />);

        expect(screen.getByText('Call For Presentation App')).toBeTruthy();
        expect(screen.queryByRole('button')).toBeNull();
    });
});
