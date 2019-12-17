import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import gordonEvent from './../../services/event';
import EventList from '../../components/EventList';
import GordonLoader from '../../components/Loader';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

//import './event.css';

const styles = {
  searchBar: {
    margin: '0 auto',
  },
};

export default class Events extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      search: '',
      chapelCredits: false,
      art: false,
      sports: false,
      academics: false,
      cec: false,
      studentLife: false,
      calendar: false,
      admissions: false,
      fair: false,
      chapelOffice: false,
      allEvents: [],
      events: [],
      filteredEvents: [],
      includePast: false,
      loading: true,
      network: 'online',
    };
    this.handleExpandClick = this.handleExpandClick.bind(this);
    this.togglePastEvents = this.togglePastEvents.bind(this);
    this.isMobileView = false;
    this.breakpointWidth = 540;
  }
  componentWillMount() {
    this.loadEvents();
  }
  filterEvents(name) {
    return async event => {
      this.setState({ loading: true });
      await this.setState({ [name]: event.target.checked });
      const events = await gordonEvent.getFilteredEvents(this.state);
      this.setState({ filteredEvents: events, loading: false });
    };
  }
  handleExpandClick() {
    this.setState({ open: !this.state.open });
  }
  search(name) {
    return async event => {
      await this.setState({
        [name]: event.target.value,
      });
      const events = await gordonEvent.getFilteredEvents(this.state);
      this.setState({ filteredEvents: events, loading: false });
    };
  }

  async togglePastEvents() {
    //set events to all or to all future
    if (this.state.includePast === false) {
      this.setState({ includePast: true });
      await this.setState({ events: this.state.allEvents });
    } else {
      this.setState({ includePast: false });
      const futureEvents = gordonEvent.getFutureEvents(this.state.allEvents);
      await this.setState({ events: futureEvents });
    }
    //filter events to reflect boxes still checked
    const events = gordonEvent.getFilteredEvents(this.state);
    this.setState({ filteredEvents: events, loading: false });
  }

  //This should be the only time we pull from the database
  async loadEvents() {
    this.setState({ loading: true });
    if (this.props.Authentication) {
      const allEvents = await gordonEvent.getAllEventsFormatted(); //Retrieve all events from database
      const events = gordonEvent.getFutureEvents(allEvents); //Filter out past events initially
      this.setState({ allEvents, events, loading: false, filteredEvents: events });
    } else {
      const allEvents = await gordonEvent.getAllGuestEventsFormatted(); //Retrieve all Guest events from database
      const events = gordonEvent.getFutureEvents(allEvents); //Filter out past events initially
      this.setState({ allEvents, events, loading: false, filteredEvents: events });
    }
  }

  //Has to rerender on screen resize in order for table to switch to the mobile view
  resize = () => {
    if (this.breakpointPassed()) {
      this.isMobileView = !this.isMobileView;
      this.forceUpdate();
    }
  };

  //checks if the screen has been resized past the mobile breakpoint
  //allows for forceUpdate to only be called when necessary, improving resizing performance
  breakpointPassed() {
    if (this.isMobileView && window.innerWidth > this.breakpointWidth) return true;
    if (!this.isMobileView && window.innerWidth < this.breakpointWidth) return true;
    else return false;
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  render() {
    let content;

    /* Used to re-render the page when the network connection changes.
     *  this.state.network is compared to the message received to prevent
     *  multiple re-renders that creates extreme performance lost.
     *  The origin of the message is checked to prevent cross-site scripting attacks
     */
    window.addEventListener('message', event => {
      if (
        event.data === 'online' &&
        this.state.network === 'offline' &&
        event.origin === window.location.origin
      ) {
        this.setState({ network: 'online' });
      } else if (
        event.data === 'offline' &&
        this.state.network === 'online' &&
        event.origin === window.location.origin
      ) {
        this.setState({ network: 'offline' });
      }
    });

    /* Gets status of current network connection for online/offline rendering
     *  Defaults to online in case of PWA not being possible
     */
    const networkStatus = JSON.parse(localStorage.getItem('network-status')) || 'online';

    if (this.state.loading === true) {
      content = <GordonLoader />;
    } else if (this.state.events.length > 0) {
      content = <EventList events={this.state.filteredEvents} />;
    } else {
      content = (
        <Grid item>
          <Typography variant="h4">No Events To Show</Typography>
        </Grid>
      );
    }

    let filter;
    if (this.state.loading === true) {
    } else {
      filter = (
        <Collapse in={this.state.open} timeout="auto" unmountOnExit>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.academics}
                  onChange={this.filterEvents('academics')}
                />
              }
              label="Academics"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.admissions}
                  onChange={this.filterEvents('admissions')}
                />
              }
              label="Admissions"
            />
            <FormControlLabel
              control={<Checkbox checked={this.state.art} onChange={this.filterEvents('art')} />}
              label="Arts"
            />
            <FormControlLabel
              control={
                <Checkbox checked={this.state.sports} onChange={this.filterEvents('sports')} />
              }
              label="Athletics"
            />
            <FormControlLabel
              control={
                <Checkbox checked={this.state.calendar} onChange={this.filterEvents('calendar')} />
              }
              label="Calendar Events"
            />
            <FormControlLabel
              control={<Checkbox checked={this.state.cec} onChange={this.filterEvents('cec')} />}
              label="CEC"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.chapelOffice}
                  onChange={this.filterEvents('chapelOffice')}
                />
              }
              label="Chapel Office"
            />

            <FormControlLabel
              control={<Checkbox checked={this.state.fair} onChange={this.filterEvents('fair')} />}
              label="Fair or Expos"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.studentLife}
                  onChange={this.filterEvents('studentLife')}
                />
              }
              label="Student Life"
            />
          </FormGroup>
        </Collapse>
      );
    }

    let events;
    // If the user is online
    if (networkStatus === 'online' || (networkStatus === 'offline' && this.props.Authentication)) {
      events = (
        <section>
          <Grid container justify="center">
            <Grid item xs={12} md={12} lg={8}>
              <Grid container alignItems="baseline" style={styles.searchBar} spacing={8}>
                <Grid item xs={7} sm={10} md={6} lg={6}>
                  <TextField
                    id="search"
                    label="Search"
                    value={this.state.search}
                    onChange={this.search('search')}
                    margin="none"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4} sm={2} md={2} lg={2} align="center">
                  <Button variant="contained" color="primary" onClick={this.handleExpandClick}>
                    Filters
                  </Button>
                </Grid>

                <Grid item xs={6} sm={4} md={2} lg={2}>
                  <FormControlLabel
                    control={<Switch onChange={this.togglePastEvents} />}
                    label="Include Past"
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={2} lg={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={this.state.chapelCredits}
                        onChange={this.filterEvents('chapelCredits')}
                        aria-label="chapelCredits"
                      />
                    }
                    label="CL&amp;W Only"
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={12} lg={8}>
              {filter}
              {content}
            </Grid>
          </Grid>
        </section>
      );
    }
    // If the user is offline
    else {
      events = (
        <Grid container justify="center" spacing="16">
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent
                style={{
                  margin: 'auto',
                  textAlign: 'center',
                }}
              >
                <Grid
                  item
                  xs={2}
                  alignItems="center"
                  style={{
                    display: 'block',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                >
                  <img
                    src={require(`${'../../NoConnection.svg'}`)}
                    alt="Internet Connection Lost"
                  />
                </Grid>
                <br />
                <h1>Please Re-establish Connection</h1>
                <h4>Viewing Events has been deactivated due to loss of network.</h4>
                <br />
                <br />
                <Button
                  color="primary"
                  backgroundColor="white"
                  variant="outlined"
                  onClick={() => {
                    window.location.pathname = '';
                  }}
                >
                  Back To Home
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }

    return events;
  }
}
