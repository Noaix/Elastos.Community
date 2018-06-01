import React from 'react'
import { Link } from 'react-router-dom'
import AdminPage from '../../BaseAdmin'
import { Button, Card, Select, Col, message, Row, Breadcrumb, Icon, List, Avatar } from 'antd'
import _ from 'lodash'
import ModalAddCountry from '../../shared/ModalAddCountry/Component'
import config from '@/config'
import Navigator from '../../shared/Navigator/Component'

import '../style.scss'

export default class extends AdminPage {
    state = {
        visibleModalAddCountry: false,
        communities: []
    }

    // Modal add country
    showModalAddCountry = () => {
        this.formRefAddCountry.props.form.setFieldsValue({
            geolocation: this.props.match.params['country'],
        }, () => {
            this.setState({
                visibleModalAddCountry: true,
            })
        })
    }
    handleCancelModalAddCountry = () => {
        const form = this.formRefAddCountry.props.form
        form.resetFields()

        this.setState({visibleModalAddCountry: false})
    }
    handleCreateCountry = () => {
        const form = this.formRefAddCountry.props.form

        form.validateFields((err, values) => {
            if (err) {
                return
            }

            form.resetFields()
            this.setState({visibleModalAddCountry: false})

            console.log('values', values);
            this.props.addCountry({
                geolocation: values.geolocation,
                leaderIds: config.data.mockDataLeaderId, // Just mock data, in future use may set it from values.leaderId
            }).then(() => {
                message.success('Add new country successfully')

                this.loadCommunities();
            }).catch((err) => {
                console.error(err);
                message.error('Error while add country')
            })
        })
    }
    saveFormAddCountryRef = (formRef) => {
        this.formRefAddCountry = formRef
    }

    componentDidMount() {
        this.loadCommunities();
    }

    loadCommunities() {
        const currentCountry = this.props.match.params['country'];
        if (currentCountry) {
            this.props.getSpecificCountryCommunities(currentCountry).then((communities) => {
                this.setState({
                    communities
                })
            })
        } else {
            this.props.getAllCountryCommunity().then((communities) => {
                this.setState({
                    communities
                })
            })
        }
    }

    handleChangeCountry(geolocation) {
        if (geolocation) {
            this.props.getSpecificCountryCommunities(geolocation).then((communities) => {
                this.setState({
                    communities
                })

                this.props.history.push(`/admin/community/country/${geolocation}`)
            })
        } else {
            this.props.getAllCountryCommunity().then((communities) => {
                this.setState({
                    communities
                })

                this.props.history.push('/admin/community')
            })
        }
    }

    ord_renderContent () {
        const listCommunitiesEl = this.state.communities.map((community, index) => {

            /*
            const leaderData = [{
                firstName: 'John',
                lastName: 'Smith',
                avatar: 'https://www.w3schools.com/howto/img_avatar.png'
            }, {
                firstName: 'Mary',
                lastName: 'Jane',
                avatar: 'https://www.w3schools.com/howto/img_avatar.png'
            }]
            */

            const leaderData = []

            return (
                <Col span={6} key={index} className="user-card">
                    <Link to={'/admin/community/' + community._id  + '/country/' + community.geolocation}>
                        <Card title={community.name}>
                            <List
                                dataSource={leaderData}
                                renderItem={item => (
                                    <List.Item className="organizerListItem">
                                        <table>
                                            <tbody>
                                            <tr>
                                                <td>
                                                    <Avatar size="large" icon="user" src={item.avatar}/>
                                                </td>
                                                <td>
                                                    {item.firstName} {item.lastName}
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Link>
                </Col>
            )
        })

        // here we only want to show communities
        const listCountriesEl = this.state.communities.map((country, index) => {
            return (
                <Select.Option title={country.name} key={index}
                               value={country.geolocation}>{country.name}</Select.Option>
            )
        })

        const menuCountriesEl = (
            <Select
                allowClear
                value={this.props.match.params['country'] || undefined}
                showSearch
                style={{width: 160}}
                placeholder="Select a country"
                optionFilterProp="children"
                onChange={this.handleChangeCountry.bind(this)}
            >
                {listCountriesEl}
            </Select>
        )

        return (
            <div className="p_admin_index ebp-wrap c_adminCommunity">
                <div className="d_box">
                    <div className="p_admin_breadcrumb">
                        <Breadcrumb>
                            <Breadcrumb.Item href="/">
                                <Icon type="home"/>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>Admin</Breadcrumb.Item>
                            <Breadcrumb.Item>
                                <Link to="/admin/community">Community</Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                {menuCountriesEl}
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </div>
                    <div className="p_admin_content">
                        <Row>
                            <Col span={20}
                                 className="admin-left-column wrap-box-user">
                                <div>
                                    <Button className="ant-btn-ebp pull-right" onClick={this.showModalAddCountry} type="primary">Add country</Button>
                                    <h2 className="without-padding">Country Organizers</h2>
                                    <Row>
                                        {listCommunitiesEl}
                                    </Row>

                                    <ModalAddCountry
                                        wrappedComponentRef={this.saveFormAddCountryRef}
                                        visible={this.state.visibleModalAddCountry}
                                        onCancel={this.handleCancelModalAddCountry}
                                        onCreate={this.handleCreateCountry}
                                    />
                                </div>
                            </Col>
                            <Col span={4}
                                 className="admin-right-column wrap-box-navigator">
                                <Navigator selectedItem={'community'}/>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        )
    }
}