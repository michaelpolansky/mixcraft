/**
 * Parse Concept Links Tests
 * Tests for the [[concept-id|display text]] marker parser.
 */

import { describe, it, expect } from 'vitest';
import { parseConceptLinks, type HintSegment } from '../../../ui/utils/parse-concept-links.ts';

describe('parseConceptLinks', () => {
  it('returns single text segment for plain text', () => {
    const result = parseConceptLinks('This is a plain hint with no links.');
    expect(result).toEqual([
      { type: 'text', value: 'This is a plain hint with no links.' },
    ]);
  });

  it('parses a single concept link', () => {
    const result = parseConceptLinks('Learn about [[filter-cutoff|filter cutoff]].');
    expect(result).toEqual([
      { type: 'text', value: 'Learn about ' },
      { type: 'link', conceptId: 'filter-cutoff', label: 'filter cutoff' },
      { type: 'text', value: '.' },
    ]);
  });

  it('parses multiple concept links', () => {
    const result = parseConceptLinks('Use [[lfo|LFO]] to modulate the [[filter-cutoff|cutoff]].');
    expect(result).toEqual([
      { type: 'text', value: 'Use ' },
      { type: 'link', conceptId: 'lfo', label: 'LFO' },
      { type: 'text', value: ' to modulate the ' },
      { type: 'link', conceptId: 'filter-cutoff', label: 'cutoff' },
      { type: 'text', value: '.' },
    ]);
  });

  it('handles link at start of string', () => {
    const result = parseConceptLinks('[[adsr|ADSR]] controls the shape of the sound.');
    expect(result).toEqual([
      { type: 'link', conceptId: 'adsr', label: 'ADSR' },
      { type: 'text', value: ' controls the shape of the sound.' },
    ]);
  });

  it('handles link at end of string', () => {
    const result = parseConceptLinks('This uses a [[reverb|reverb]]');
    expect(result).toEqual([
      { type: 'text', value: 'This uses a ' },
      { type: 'link', conceptId: 'reverb', label: 'reverb' },
    ]);
  });

  it('handles adjacent links with no text between', () => {
    const result = parseConceptLinks('[[eq|EQ]][[compression|compression]]');
    expect(result).toEqual([
      { type: 'link', conceptId: 'eq', label: 'EQ' },
      { type: 'link', conceptId: 'compression', label: 'compression' },
    ]);
  });

  it('handles empty string', () => {
    const result = parseConceptLinks('');
    expect(result).toEqual([
      { type: 'text', value: '' },
    ]);
  });

  it('handles link-only string', () => {
    const result = parseConceptLinks('[[waveform|Waveform]]');
    expect(result).toEqual([
      { type: 'link', conceptId: 'waveform', label: 'Waveform' },
    ]);
  });

  it('does not parse malformed links', () => {
    // Missing closing brackets
    const result1 = parseConceptLinks('This [[filter-cutoff|is broken');
    expect(result1).toEqual([
      { type: 'text', value: 'This [[filter-cutoff|is broken' },
    ]);

    // Missing pipe
    const result2 = parseConceptLinks('This [[filter-cutoff]] is missing pipe');
    expect(result2).toEqual([
      { type: 'text', value: 'This [[filter-cutoff]] is missing pipe' },
    ]);
  });

  it('preserves text around links exactly', () => {
    const input = '  leading spaces [[lfo|LFO]] trailing spaces  ';
    const result = parseConceptLinks(input);
    expect(result[0]).toEqual({ type: 'text', value: '  leading spaces ' });
    expect(result[1]).toEqual({ type: 'link', conceptId: 'lfo', label: 'LFO' });
    expect(result[2]).toEqual({ type: 'text', value: ' trailing spaces  ' });
  });

  it('handles concept IDs with multiple hyphens', () => {
    const result = parseConceptLinks('Use [[amplitude-envelope|amplitude envelope]].');
    expect(result[1]).toEqual({
      type: 'link',
      conceptId: 'amplitude-envelope',
      label: 'amplitude envelope',
    });
  });

  it('handles labels with special characters', () => {
    const result = parseConceptLinks('Adjust the [[eq|EQ (3-band)]] settings.');
    expect(result[1]).toEqual({
      type: 'link',
      conceptId: 'eq',
      label: 'EQ (3-band)',
    });
  });
});
