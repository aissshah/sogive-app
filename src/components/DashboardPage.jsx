import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { assert } from 'sjtest';
import _ from 'lodash';
import { XId } from 'wwutils';

import printer from '../utils/printer';
// import C from '../C';
import ServerIO from '../plumbing/ServerIO';
import { showLoginMenu } from './genericActions';
// import ChartWidget from './ChartWidget';
import Misc from './Misc';


class DashboardPage extends Component {
	render() {
		const { user, openLogin, openRegister } = this.props;
		const donations = this.state && this.state.donations;

		let content;

		if (!user) {
			content = (
				<div>
					<a href='#' onClick={openLogin}>Login</a> or <a href='#' onClick={openRegister}>register</a> to track your donations.
				</div>
			);
		} else if (!donations) {
			ServerIO.getDonations()
			.then(function(result) {
				let dons = result.cargo.hits;
				this.setState({donations: dons});
			}.bind(this));
			content = <Misc.Loading />;
		} else {
			content = (
				<DashboardWidget title="Donation History">
					<DonationList donations={this.state.donations} />
				</DashboardWidget>
			);
		}

		// display...
		return (
			<div className="page DashboardPage">
				<h2>My Dashboard</h2>
				{ content }
			</div>
		);
	}
} // ./DashboardPage


const DonationList = ({donations}) => {
	return <div>{ _.map(donations, d => <Donation key={'d'+d.id} donation={d} />) }</div>;
};

const Donation = ({donation}) => {
	return (<div className='well'>
		<Misc.Time time={donation.time} /> &nbsp;
		You donated <Misc.Money precision={false} amount={donation.total} /> to {XId.id(donation.to)}. <br/>
		Impact: {printer.str(donation.impact)} <br />
		GiftAid? {donation.giftAid? 'yes' : 'no'} <br />
		Date: <Misc.Time time={donation.time} /> <br />
		<small>payment-id: {donation.paymentId}</small>
	</div>);
};

		/*<h2>Version 2+...</h2>
		<DashboardWidget title="News Feed">
			Updates from projects you support and people you follow.
		</DashboardWidget>

		<DashboardWidget title="Your Donations over Time">
			<ChartWidget type="line" />
		</DashboardWidget>

		<DashboardWidget title="Donations by Category">
			Pie chart of what you give to
		</DashboardWidget>

		<DashboardWidget title="Your Badges">
			Badges (encouraging use of all features, and repeated use -- but not extra £s)
		</DashboardWidget>

		<DashboardWidget title="Recent Donations">
			List of recent donations and impacts, with a link to the full history
		</DashboardWidget>*/


const DashboardWidget = ({ children, iconClass, title }) =>
	<div className="panel panel-default">
		<div className="panel-heading">
			<h3 className="panel-title"><DashTitleIcon iconClass={iconClass} /> {title || ''}</h3>
		</div>
		<div className="panel-body">
			{children}
		</div>
	</div>;
// ./DashboardWidget

DashboardWidget.propTypes = {
	children: PropTypes.element,
	iconClass: PropTypes.string,
	title: PropTypes.string,
};

const DashTitleIcon = ({ iconClass }) =>
	<i className={iconClass} aria-hidden="true" />;

DashTitleIcon.propTypes = {
	iconClass: PropTypes.string,
};


const mapStateToProps = (state, ownProps) => ({
	...ownProps,
	user: state.login.user,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	openLogin: () => dispatch(showLoginMenu(true, 'login')),
	openRegister: () => dispatch(showLoginMenu(true, 'register')),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(DashboardPage);
