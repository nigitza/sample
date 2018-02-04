/**
 * Necessary libraries
 */ 
var DOMParser = require('xmldom').DOMParser;
var REQUEST_URL = "http://api.foxsports.com/v1/rss?partnerKey=zBaFxRyGKCfxBagJG9b8pqLyndmvo7UU&tag=nba";
var WNBA_REQUEST_URL = "http://api.foxsports.com/v1/rss?partnerKey=zBaFxRyGKCfxBagJG9b8pqLyndmvo7UU&tag=wnba";
var Dimensions = require('Dimensions');
var windowSize = Dimensions.get('window');


/**
 * Necessary imports
 */
import React, {
  Component,
} from 'react';
import {
  AppRegistry,
  Image,
  ListView,
  StyleSheet,
  StatusBar,
  Text,
  View,
  ToolbarAndroid,
  TouchableHighlight,
  BackAndroid,
  Navigator,
  ScrollView,
  WebView,
  Button,
  Picker,
  Alert
} from 'react-native';

//status bar set color 
StatusBar.setBackgroundColor('#9598A6', true);

class RSSReactNativeApp extends Component {
  constructor(props) {
    super(props);
    //const ds_urls = new ListView.DataSource
    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      url: '',
      title: 'RSS Feeds',
      rss_url: REQUEST_URL,
    };
  }

  componentDidMount() {
    this.fetchData();
      BackAndroid.addEventListener('hardwareBackPress', () => {
        if (this.refs.navigator.getCurrentRoutes().length === 1  ) {
           return false;
        }
        
        this.refs.navigator.pop();
        return true;
      });
  }
  
/**
 * Extracts data from the XML response
 */
  extractData (text) {
    var doc = new DOMParser().parseFromString(text, 'text/xml');
    var items_array = [];
    var items = doc.getElementsByTagName('item');
    for (var i=0; i < items.length; i++) {
      items_array.push({
        title: items[i].getElementsByTagName('title')[0].lastChild.data,
        description: items[i].getElementsByTagName('description')[0].lastChild.data,
        thumbnail: items[i].getElementsByTagName('enclosure')[0].getAttribute('url'),
         link: items[i].getElementsByTagName('link')[0].textContent,
        date: items[i].getElementsByTagName('pubDate')[0].textContent,                    
      })
    }
	  var channel = doc.getElementsByTagName('channel');
    //console.log(channel);
    this.setState({title: channel[0].getElementsByTagName('title')[0].textContent});
    return items_array;
  }
  
  
/**
 * Datasource populate
 */
  fetchData() {
    fetch(this.state.rss_url)
      .then((response) => response.text())
      .then((responseData) => {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(this.extractData(responseData))
        });
      }).done();
    // var items_array =[
    //     {title: 'test', description: 'test description', thumbnail:'test.jpg', 
    //     link:'test.com', date:'2017-01-16'},
    //     {title: 'test', description: 'test description', thumbnail:'test.jpg', 
    //     link:'test.com', date:'2017-01-16'}
    // ]
    // this.setState({ dataSource: items_array });
 }

  render() {
    var initialRoute = {name: 'list'};
    return (
      <Navigator ref="navigator"
        initialRoute={initialRoute}
        configureScene={() => Navigator.SceneConfigs.FloatFromRight}
        renderScene={this.RouteMapper.bind(this)}
      />
    );
  }
 _onValueChange(key, value) {
   this.setState({rss_url: value});
   Alert.alert('RSS Feed Picker', 'You Select RSS Feed'+key); 
 }

/**
 * Router
 */
  RouteMapper(route, navigator) {

    if(route.name == 'list') {
      return (
      <View style={styles.view}  navigator={navigator}>
          <Picker style={{color:'#FFFFFF'}} selectedValue={REQUEST_URL}
            onValueChange={() => this._onValueChange(this,'rss_url')}>
            <Picker.Item label="Fox Sports NBA" value={REQUEST_URL} />
            <Picker.Item label="Fox Sports WNBA" value={WNBA_REQUEST_URL} />
          </Picker>
          <ToolbarAndroid style={styles.toolbar}
             title={this.state.title}
             titleColor={'#FFFFFF'}/>
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this.renderFeed.bind(this)}
            style={styles.listView}
            list={route.list}/>
        </View>
      );
    }

    if(route.name == 'details') {
       return (
      <View style={styles.view} navigator={navigator}>
          <ToolbarAndroid style={styles.toolbar}
            title={this.state.title}
            titleColor={'#FFFFFF'}/>
        <ScrollView style={styles.scrollView}>
          <Image
            source={{uri: route.feed_data.thumbnail}}
            style={styles.fullImage}/>           
            <View style={styles.textContainer}>
              <Text style={styles.descriptionText}>{route.feed_data.description}</Text>
              <Text style={styles.date}>{route.feed_data.date}</Text>
            </View>
            <Button
              style={{borderWidth: 1, borderColor: 'blue'}}
              onPress={() => this.goToUrl(route.feed_data)} 
              title="Read More.."
              />
        </ScrollView>
        </View>
      );
    }

    return (
      <View style={styles.view}  navigator={navigator}>
      <ToolbarAndroid style={styles.toolbar}
             title={this.state.title}
             titleColor={'#FFFFFF'}/>
      <WebView navigator={navigator}
      source={{uri:this.state.url}}/>
      </View>
    );
  }
  
/**
 * Navigates to external url
 */
  goToUrl(feed_data) {
    this.setState({url: feed_data.link});
    this.refs.navigator.push({
      name: 'webview'
    })
  }

  _pressRow(selected_feed) {
    this.refs.navigator.push({
      name: 'details',
      feed_data: selected_feed
    })
  }
  
/**
 * List item render
 */
  renderFeed(feed) {
    return (
      <TouchableHighlight onPress={() => this._pressRow(feed)}>
        <View style={styles.container}>
          <Image
            source={{uri: feed.thumbnail}}
            style={styles.thumbnail}/>
          <View style={styles.rightContainer}>
            <Text style={styles.title}>{feed.title}</Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

/**
 * Styles declaration
 */
var styles = StyleSheet.create({
  container: {
    padding: 5,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  rightContainer: {
    flex: 1,
    marginLeft: 10
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    color: '#FFFFFF'
  },
  white: {
    color: '#FFFFFF'
  },
  year: {
    textAlign: 'center',
  },
  thumbnail: {
    width: 150,
    height: 150
  },
  listView: {
    backgroundColor: '#000000',
    flex:1,
  },
  view: {
    backgroundColor: '#000000',
  	flex:1
  },
  textContainer: {
    padding: 10
  },
  toolbar: {
    backgroundColor: '#9598A6',
    height: 56,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 20
  },
  descriptionText: {
    fontSize: 20,
    color: '#FFFFFF'
  },
  date: {
    marginTop: 20,
    textAlign: 'center',
    color: '#FF1422'
  },
  fullImage: {
    width: windowSize.width,
    height: 300,
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)'
  },
  scrollView: {
    flex:1
  }
});


AppRegistry.registerComponent('RSSReactNativeApp', () => RSSReactNativeApp);
