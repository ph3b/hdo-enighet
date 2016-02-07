import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
import d3 from 'd3';
import Sparkline from './Sparkline';
import { logoFor } from './utils';
import cn from 'classnames';

export default class AgreementTable extends Component {
    state = {comboHighlight: {}};

    scale = d3.scale
        .linear()
        .domain([0, 1, 50, 100])
        // .range(['#B41917', '#1E6419']);
        .range(['white', '#dd0000', 'white', '#106E0E']);

    render() {
        const {
            parties,
        } = this.props;

        const {
            left: highlightLeft,
            right: highlightRight
        } = this.state.comboHighlight;

        return (
            <div className="table-responsive">
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <th className="diagonal" />
                            {parties.map(p => <th key={p} className={cn({highlight: p === highlightRight})} >{logoFor(p)}</th>)}
                        </tr>
                    </thead>

                    <tbody>
                        {parties.map((party, rowIndex) => (
                            <tr key={party}>
                                <th className={cn({highlight: party === highlightLeft})}>{logoFor(party)}</th>
                                {
                                    parties.map((otherParty, colIndex) =>
                                        this.renderComparison(party, otherParty, rowIndex, colIndex)
                                    )
                                }
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          );
    }

    renderComparison(left, right, rowIndex, colIndex) {
        const key = [left,right].sort().join(',');
        const highlight = this.state.comboHighlight.left == left || this.state.comboHighlight.right === right;

        const {
            selectedSession,
            selectedCategory,
            sessions,
            bySession,
            allTime
        } = this.props;

        if (left == right) {
            return <td key={key} className="diagonal" />;
        }

        let combo;

        if (selectedSession === 'all') {
            combo = selectedCategory === 'all' ? allTime.all[key] : allTime.categories[selectedCategory] && allTime.categories[selectedCategory][key];
        } else {
            combo = selectedCategory === 'all' ? bySession[selectedSession].all[key] : bySession[selectedSession].categories[selectedCategory] && bySession[selectedSession].categories[selectedCategory][key];
        }

        let val = 0;
        let title = '';

        if (combo) {
            val = Math.round((combo.count / combo.total) * 100);
            title = `${left} v. ${right}: ${combo.count} / ${combo.total} voteringsforslag`;
        }

        return (
            <Motion key={key} defaultStyle={{val: val}} style={{val: spring(val, [300, 50])}}>
                {value => (
                    <td
                        title={title}
                        onClick={this.setHash.bind(null, [left,right].sort().join('-v-'))}
                        onMouseOver={this.setComboHighlight.bind(this, left, right)}
                        onMouseOut={this.setComboHighlight.bind(this, null, null)}
                        className={cn('text-center', 'clickable', {highlight, diagonal: value.val === 0})}
                        style={{backgroundColor: this.scale(value.val), color: (value.val > 80 || value.val < 20) ? '#eee' : 'inherit'}}>
                            {value.val === 0 ? '' : `${Math.round(value.val)}%`}
                    </td>
                )}
            </Motion>
        );
    }

    setHash(hash) {
        window.location.hash = hash;
    }

    setComboHighlight(left, right) {
        this.setState({comboHighlight: {left, right}})
    }
}


