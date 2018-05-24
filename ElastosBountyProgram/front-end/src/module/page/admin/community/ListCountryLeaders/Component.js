import React from 'react'
import { Link } from 'react-router-dom'
import BaseComponent from '@/model/BaseComponent'
import { Button, Card, Col, message, Row } from 'antd'

import ModalAddCountry from '../../shared/ModalAddCountry/Component'
import config from '@/config'

import './style.scss'

export default class extends BaseComponent {
    state = {
        visibleModalAddCountry: false,
        visibleModalChangeLeader: false,
    }
    
    redirectToCountryDetail(leader) {
        console.log('leader', leader);
    }

    // Modal add country
    showModalAddCountry = () => {
        this.setState({visibleModalAddCountry: true})
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
    
            this.props.addCountry(values);
        })
    }
    saveFormAddCountryRef = (formRef) => {
        this.formRefAddCountry = formRef
    }

    ord_render () {
        const listLeaders = this.props.leaders;

        const listLeadersEl = listLeaders.map((leader, index) => {
            // TODO API need return object leader instead of leaderId, mock data till they update
            leader = config.data.mockDataAllLeaders[0];

            return (
                <Col span={6} key={index} className="user-card">
                    <Link to={'/admin/community/' + leader.countryCode + '/leader/' + leader.id}>
                        <Card
                            hoverable
                            onClick={this.redirectToCountryDetail.bind(this,
                                leader)}
                            cover={<img alt="example" src={leader.avatar}/>}
                        >
                            <Card.Meta
                                title={leader.name}
                                description={leader.country}
                            />
                        </Card>
                    </Link>
                </Col>
            )
        })
        return (
            <div>
                <Button className="pull-right" onClick={this.showModalAddCountry} type="primary">Add country</Button>
                <h1>Country Leaders</h1>
                <Row>
                    {listLeadersEl}
                </Row>

                <ModalAddCountry
                    wrappedComponentRef={this.saveFormAddCountryRef}
                    visible={this.state.visibleModalAddCountry}
                    onCancel={this.handleCancelModalAddCountry}
                    onCreate={this.handleCreateCountry}
                />
            </div>
        )
    }

    handleSubmitAddCountry (country) {
        console.log('handleSubmitAddCountry', country)

        this.setState({
            visibleModalAddCountry: false,
        })
    }
}